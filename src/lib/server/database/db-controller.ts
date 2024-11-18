import type { Client } from '@libsql/client';
import type {
  DbResponse,
  OptRole,
  ScheduleRecord,
  TimeEntryRecord,
  TimeEntryReport,
  UserInfo,
  UserProfile,
  UserRecord,
  UserTimesheetReport
} from '$lib/types/schema';
import { QUERY, WRITE } from './sql-queries';
import { DBClient, getClient } from './turso';
import { parseJSON } from '$lib/utility';
import type { SearchOptions } from '$lib/validation';

export class DatabaseController extends DBClient {
  constructor(dbClient: Client) {
    super(dbClient);
  }

  public async getUser(id: number): Promise<DbResponse<UserRecord>> {
    const { sql, args } = QUERY.USER({ user_id: id });
    const { data, error } = await super.get(sql, args);
    if (error) {
      return { data, error };
    }

    return { data: toUserRecord(data.rows[0]) };
  }

  public async getUserValidation(
    userId: number
  ): Promise<DbResponse<UserRecord & { sched_id: number }>> {
    const { data, error } = await super.get(
      `SELECT users.id, users.active, users.password_hash, sched.id as sched_id
            FROM users LEFT JOIN schedules sched ON users.id = sched.user_id
            WHERE users.id = $userId LIMIT 1`,
      { userId }
    );

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        sched_id: data.rows[0].sched_id as number,
        ...toUserRecord(data.rows[0])
      }
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
  ): Promise<{ profile: UserProfile | null; schedules: ScheduleRecord[] }> {
    const results = await super.batchGet([
      QUERY.USER_PROFILE({ user_id: userId }),
      QUERY.SCHEDULES({ user_id: userId, limit: schedule_count })
    ]);

    const [{ rows: userData = [] } = {}, { rows: userSchedules = [] } = {}] = results || [];

    return {
      profile: userData.length ? toUserProfile(userData[0]) : null,
      schedules: userSchedules ? userSchedules.map(toUserScheddule) : []
    };
  }

  public async getTimeEntries(
    userId: number,
    dateRange: { dateStart: string; dateEnd: string }
  ): Promise<DbResponse<TimeEntryReport[]>> {
    const { args, sql } = QUERY.USER_ENTRIES({ user_id: userId, ...dateRange });
    const { data, error } = await super.get(sql, args);

    if (error) {
      return { data: null, error };
    }

    return {
      data: data.rows.map((row) => {
        return {
          ...toTimeEntryRecord(row),
          utc_offset: row.utc_offset as number,
          local_offset: row.local_offset as number,
          clock_at: row.clock_at as string,
          effective_date: row.effective_date as string
        };
      })
    };
  }

  public async getManyUsers(params: SearchOptions) {
    const { sql, args } = QUERY.USERS_INFO(params);
    return await super.get(sql, args);
  }

  public async searchUsers(params: SearchOptions) {
    const { sql, args } = QUERY.SEARCH_USER(params);
    return await super.get(sql, args);
  }

  public async getAdmninInitData(params: { id: number, role: OptRole, region: string}) {
    const [regions, leads] = (await super.batchGet([QUERY.REGIONS(), QUERY.LEADS(params)])) || [];
    return {
      regions: regions?.rows.map((r) => String(r.region)) || [],
      leads: leads?.rows
        .map((l) => {
          return { id: Number(l.id), name: String(l.name), region: String(l.region) };
        })
        .toSorted((a, b) => b.id - a.id)
    };
  }

  public async searchUserTimeEntries(params: {
    search: string;
    date_at: string;
    region?: string | null;
  }): Promise<DbResponse<UserTimesheetReport[]>> {
    const { sql, args } = QUERY.SEARCH_USER_TIME_ENTRIES(params);
    const { data, error } = await super.get(sql, args);

    if (error) {
      return { data: null, error };
    }

    return {
      data: data.rows.map((row) => {
        return {
          ...toTimeEntryRecord(row),
          utc_offset: row.utc_offset as number,
          local_offset: row.local_offset as number,
          clock_at: row.clock_at as string,
          effective_date: row.effective_date as string,
          clock_dur_min: row.clock_dur_min as number,
          break_dur_min: row.break_dur_min as number,
          lunch_dur_min: row.lunch_dur_min as number,
          name: row.name as string,
          region: row.region as string
        };
      })
    };
  }

  public async startTime(
    args: Omit<TimeEntryRecord, 'id' | 'end_at' | 'elapse_sec' | 'total_sec'>
  ): Promise<DbResponse<TimeEntryRecord>> {
    const q = WRITE.STARTTIME(args);
    const { data, error } = await super.set(q.sql, q.args);

    if (error) {
      return { data, error };
    }
    return { data: toTimeEntryRecord(data.rows[0]) };
  }

  public async endTime(
    args: Pick<TimeEntryRecord, 'id' | 'end_at' | 'user_ip' | 'user_agent' | 'remarks'>
  ): Promise<DbResponse<TimeEntryRecord>> {
    const q = WRITE.ENDTIME(args);
    const { data, error } = await super.set(q.sql, q.args);

    if (error) {
      return { data, error };
    }
    return { data: toTimeEntryRecord(data.rows[0]) };
  }

  public async updatePassword(userId: number, password: string): Promise<DbResponse<boolean>> {
    const q = WRITE.UPDATE_PASSWORD({ user_id: userId, password_hash: password });
    const { data, error } = await super.set(q.sql, q.args);

    if (error) {
      return { data, error };
    }

    return { data: data.rowsAffected > 0 };
  }

  public async createUserSchedule(
    args: Omit<ScheduleRecord, 'id'>
  ): Promise<DbResponse<ScheduleRecord>> {
    const q = WRITE.ADD_USER_SCHEDULE(args);
    const { data, error } = await super.set(q.sql, q.args);

    if (error) {
      return { data, error };
    }

    return { data: toUserScheddule(data.rows[0]) };
  }

  public async updateManyUser(
    args: Pick<UserRecord, 'id' | 'lead_id' | 'region' | 'lock_password'>[]
  ): Promise<DbResponse<UserRecord[]>> {
    const { data, error } = await super.batchSet(args.map((user) => WRITE.UPDATE_MANY_USER(user)));

    if (error) {
      return { data: null, error };
    }

    return {
      data: data.map((user) => toUserRecord(user.rows[0]))
    };
  }

  public async createManySchedule(
    args: Omit<ScheduleRecord, 'id'>[]
  ): Promise<DbResponse<ScheduleRecord[]>> {
    const { data, error } = await super.batchSet(
      args.map((sched) => WRITE.ADD_USER_SCHEDULE(sched))
    );

    if (error) {
      return { data: null, error };
    }

    return { data: data.map((sched) => toUserScheddule(sched.rows[0])) };
  }

  public async createUser(
    args: Pick<UserRecord, 'id' | 'name' | 'lead_id' | 'region' | 'password_hash'>
  ): Promise<DbResponse<UserRecord>> {
    const q = WRITE.INSERT_USER(args);
    const { data, error } = await super.set(q.sql, q.args);

    if (error) {
      return { data, error };
    }

    return { data: toUserRecord(data.rows[0]) };
  }

  public async updateUser(
    user: Omit<UserRecord, 'password_hash' | 'preferences'>
  ): Promise<DbResponse<UserRecord>> {
    const q = WRITE.UPDATE_USER(user);

    const { data, error } = await super.set(q.sql, q.args);

    if (error) {
      return { data, error };
    }

    return { data: toUserRecord(data.rows[0]) };
  }

  public async updateUserPreference(
    id: number,
    values: { avatar_src?: string | null; background_src?: string | null; theme?: string | null }
  ) {
    const q = WRITE.UPDATE_PREFERENCE({ id, ...values });
    const { data, error } = await super.set(q.sql, q.args);
    if (error) {
      return { data: null, error };
    }

    return { data: parseJSON(data.rows[0]) };
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

  const val = {
    id,
    name,
    region,
    role,
    active,
    lock_password,
    password_hash,
    lead_id,
    created_at,
    updated_at,
    preferences
  };
  if (active != undefined) {
    val.active = Boolean(active);
  }

  if (lock_password != undefined) {
    val.lock_password = Boolean(lock_password);
  }

  if (preferences != undefined) {
    val.preferences = parseJSON(preferences);
  }

  return val;
}

function toUserProfile(record: Record<string, any>): UserProfile {
  const { teamlead, ...user } = record;
  return { ...toUserRecord(user), teamlead };
}

function toUserScheddule(record: Record<string, any>): ScheduleRecord {
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
