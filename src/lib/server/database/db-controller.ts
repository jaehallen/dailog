import type { Client, Row } from '@libsql/client';
import type {
  OptRole,
  ScheduleRecord,
  TimeEntryRecord,
  UserInfo,
  UserProfile,
  UserRecord
} from '$lib/types/schema';
import { QUERY, WRITE } from './sql-queries';
import { DBClient, getClient } from './turso';
import { parseJSON } from '$lib/utility';
import type { SearchOptions } from '$lib/validation';

export class DatabaseController extends DBClient {
  constructor(dbClient: Client) {
    super(dbClient);
  }

  public async getUser(id: number): Promise<UserRecord | null> {
    const { sql, args } = QUERY.USER({ user_id: id });
    const { rows = [] } = (await super.get(sql, args)) || {};

    if (!rows.length) {
      return null;
    }

    return toUserRecord(rows[0]);
  }

  public async getUserValidation(
    userId: number
  ): Promise<(UserRecord & { sched_id: number }) | null> {
    const { rows = [] } =
      (await this.get(
        `SELECT users.id, users.active, users.password_hash, sched.id as sched_id
            FROM users LEFT JOIN schedules sched ON users.id = sched.user_id
            WHERE users.id = $userId LIMIT 1`,
        { userId }
      )) || {};

    if (!rows.length) {
      return null;
    }

    return {
      sched_id: rows[0].sched_id as number,
      ...toUserRecord(rows[0])
    };
  }

  public async getUserEntryAndSched(
    userId: number,
    clockOnly: boolean = false,
    schedLimit: number = 10
  ): Promise<Omit<UserInfo, 'user'>> {
    const results = await super.batchGet([
      QUERY.USER_SCHEDULES({ user_id: userId, limit: schedLimit }),
      !clockOnly ? QUERY.LAST_ENTRY({ user_id: userId }) : QUERY.LAST_CLOCKED({ user_id: userId })
    ]);

    const [{ rows: userSched = [] } = {}, { rows: timeData = [] } = {}] = results || [];

    return {
      schedules: userSched ? userSched.map(toUserScheddule) : [],
      timeEntries: timeData ? timeData.map(toTimeEntryRecord) : []
    };
  }

  public async getUserProfile(
    userId: number,
    schedule_count: number = 10
  ): Promise<{ user: UserProfile | null; schedules: ScheduleRecord[] }> {
    const results = await super.batchGet([
      QUERY.USER({ user_id: userId }),
      QUERY.SCHEDULES({ user_id: userId, limit: schedule_count })
    ]);

    const [{ rows: userData = [] } = {}, { rows: userSchedules = [] } = {}] = results || [];

    return {
      user: userData.length ? toUserProfile(userData[0]) : null,
      schedules: userSchedules ? userSchedules.map(toUserScheddule) : []
    };
  }

  public async getTimEntries(
    userId: number,
    dateRange: { dateStart: string; dateEnd: string }
  ): Promise<Omit<UserInfo, 'user'>> {
    const [schedules, timeEntries] =
      (await super.batchGet([
        QUERY.SCHEDULES({ user_id: userId, limit: 10 }),
        QUERY.USER_ENTRIES({ user_id: userId, ...dateRange })
      ])) || [];

    return {
      schedules: schedules.rows.map(toUserScheddule),
      timeEntries: timeEntries.rows.map(toTimeEntryRecord)
    };
  }

  public async getManyUsers(params: SearchOptions): Promise<Row[]> {
    const { sql, args } = QUERY.USERS_INFO(params);
    const { rows = [] } = (await super.get(sql, args)) || {};

    return rows;
  }

  public async getAdmninInitData(role: OptRole) {
    const [regions, leads] = (await super.batchGet([QUERY.REGIONS(), QUERY.LEADS(role)])) || [];
    return {
      regions: regions?.rows.map((r) => String(r.region)) || [],
      leads: leads?.rows.map((l) => {
        return { id: Number(l.id), name: String(l.name), region: String(l.region) };
      })
    };
  }

  public async startTime(
    args: Omit<TimeEntryRecord, 'id' | 'end_at' | 'elapse_sec' | 'total_sec'>
  ) {
    const q = WRITE.STARTTIME(args);
    const results = await super.set(q.sql, q.args);
    if (!results) return null;
    return toTimeEntryRecord(results.rows[0]);
  }

  public async endTime(
    args: Pick<TimeEntryRecord, 'id' | 'end_at' | 'user_ip' | 'user_agent' | 'remarks'>
  ) {
    const q = WRITE.ENDTIME(args);
    const results = await super.set(q.sql, q.args);
    if (!results) return null;
    return toTimeEntryRecord(results.rows[0]);
  }

  public async updatePassword(userId: number, password: string) {
    const q = WRITE.UPDATE_PASSWORD({ user_id: userId, password_hash: password });
    const results = await super.set(q.sql, q.args);

    if (!results) return null;
    return results.rowsAffected > 0;
  }

  public async createUserSchedule(args: Omit<ScheduleRecord, 'id'>) {
    const q = WRITE.ADD_USER_SCHEDULE(args);
    const results = await super.set(q.sql, q.args);

    if (!results) return null;
    return toUserScheddule(results.rows[0]);
  }

  public async updateUser(user: Omit<UserRecord, 'password_hash' | 'preferences'>) {
    const q = WRITE.UPDATE_USER(user);
    const results = await super.set(q.sql, q.args);

    if (!results) return null;
    return toUserRecord(results.rows[0]);
  }
}

export function toUserRecord(record: Record<string, any>): UserRecord {
  const {
    id,
    active,
    name,
    region,
    role,
    password_hash,
    lead_id,
    lock_password,
    preferences,
    created_at,
    updated_at
  } = record;

  return {
    id,
    name,
    region,
    role,
    password_hash,
    lead_id,
    active: Boolean(active),
    lock_password: Boolean(lock_password),
    created_at,
    updated_at,
    preferences: parseJSON(preferences)
  };
}

function toUserProfile(record: Record<string, any>): UserProfile {
  const { teamlead, ...user } = record;
  return { ...toUserRecord(user), teamlead };
}

function toUserScheddule(record: Record<string, any>) {
  const {
    id,
    sched_id,
    user_id,
    effective_date,
    utc_offset,
    local_offset,
    clock_dur_min,
    lunch_dur_min,
    break_dur_min,
    clock_at,
    first_break_at,
    lunch_at,
    second_break_at,
    day_off,
    created_at
  } = record;

  return {
    id: id ? id : sched_id,
    user_id,
    effective_date,
    utc_offset,
    local_offset,
    clock_dur_min,
    lunch_dur_min,
    break_dur_min,
    clock_at,
    first_break_at,
    lunch_at,
    second_break_at,
    day_off,
    created_at
  };
}

function toTimeEntryRecord(record: Record<string, any>) {
  const { id, user_id, sched_id, category, date_at, start_at, end_at, remarks } = record || {};

  return {
    id,
    user_id,
    sched_id,
    category,
    date_at,
    start_at,
    end_at,
    remarks,
    elapse_sec: Math.floor(Date.now() / 1000) - start_at,
    total_sec: end_at > 0 ? Number(end_at) - Number(start_at) : null
  };
}

export const db = new DatabaseController(getClient());
