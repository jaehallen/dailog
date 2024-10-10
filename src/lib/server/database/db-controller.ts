import type { Client, InStatement, ResultSet } from '@libsql/client';
import type {
  ScheduleRecord,
  TimeEntryRecord,
  UserInfo,
  UserProfile,
  UserRecord
} from '$lib/schema';
import { LibsqlError } from '@libsql/client';
import { QUERY, WRITE } from './sql-queries';
import { getClient } from '$lib/server/database/turso';
import { parseJSON } from '$lib/utility';

export class DatabaseController {
  private client: Client;
  constructor(dbClient: Client) {
    this.client = dbClient;
  }

  private async get(sql: string, args: {}): Promise<ResultSet | null> {
    try {
      const results = await this.client.execute({
        sql,
        args
      });
      return results;
    } catch (error) {
      if (error instanceof LibsqlError) {
        logError('get', error as Error);
      }
    }

    return null;
  }

  private async batchGet(querries: InStatement[]): Promise<ResultSet[] | null> {
    try {
      const results = await this.client.batch(querries, 'read');
      return results;
    } catch (error: unknown) {
      logError('batchGet', error as Error);
    }

    return null;
  }

  private async set(sql: string, args: {}): Promise<ResultSet | null> {
    try {
      const results = await this.client.execute({
        sql,
        args
      });

      return results;
    } catch (error) {
      if (error instanceof LibsqlError) {
        logError('set', error as Error);
      }
    }

    return null;
  }

  public async getUser(id: number): Promise<UserRecord | null> {
    const { sql, args } = QUERY.USER({ user_id: id });
    const { rows = [] } = (await this.get(sql, args)) || {};

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
				FROM users LEFT JOIN current_schedules sched ON users.id = sched.user_id
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
    const results = await this.batchGet([
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
    const results = await this.batchGet([
      QUERY.USER({ user_id: userId }),
      QUERY.SCHEDULES({ user_id: userId, limit: schedule_count })
    ]);

    const [{ rows: userData = [] } = {}, { rows: userSchedules = [] } = {}] = results || [];

    return {
      user: userData.length ? toUserProfile(userData[0]) : null,
      schedules: userSchedules ? userSchedules.map(toUserScheddule) : []
    };
  }

  public async clockIn(args: Omit<TimeEntryRecord, 'id' | 'end_at' | 'elapse_sec' | 'total_sec'>) {
    const q = WRITE.CLOCKIN(args);
    const results = await this.set(q.sql, q.args);
    if (!results) return null;
    return toTimeEntryRecord(results.rows[0]);
  }

  public async clockOut(args: Pick<TimeEntryRecord, 'id' | 'end_at'>) {
    const q = WRITE.CLOCKOUT(args);
    const results = await this.set(q.sql, q.args);
    if (!results) return null;
    return toTimeEntryRecord(results.rows[0]);
  }

  public async startTime(
    args: Omit<
      TimeEntryRecord,
      'id' | 'end_at' | 'elapse_sec' | 'user_ip' | 'user_agent' | 'total_sec'
    >
  ) {
    const q = WRITE.BREAK_START(args);
    const results = await this.set(q.sql, q.args);
    if (!results) return null;
    return toTimeEntryRecord(results.rows[0]);
  }

  public async endTime(args: Pick<TimeEntryRecord, 'id' | 'end_at' | 'user_ip' | 'user_agent'>) {
    const q = WRITE.BREAK_END(args);
    const results = await this.set(q.sql, q.args);
    if (!results) return null;
    return toTimeEntryRecord(results.rows[0]);
  }

  public async updatePassword(userId: number, password: string) {
    const q = WRITE.UPDATE_PASSWORD({ user_id: userId, password_hash: password });
    const results = await this.set(q.sql, q.args);

    if (!results) return null;
    return results.rowsAffected > 0;
  }

  public async getTimEntries(
    userId: number,
    dateRange: { dateStart: string; dateEnd: string }
  ): Promise<Omit<UserInfo, 'user'>> {
    const [schedules, timeEntries] =
      (await this.batchGet([
        QUERY.SCHEDULES({ user_id: userId, limit: 10 }),
        QUERY.USER_ENTRIES({ user_id: userId, ...dateRange })
      ])) || [];

    return {
      schedules: schedules.rows.map(toUserScheddule),
      timeEntries: timeEntries.rows.map(toTimeEntryRecord)
    };
  }

  public async getUsersList(params: {
    lead_id?: number;
    limit?: number;
    region?: string;
    active?: number;
    offset?: number;
  }): Promise<UserRecord[]> {
    const { sql, args } = QUERY.USERS_LIST(params);
    console.log(sql, args);
    const { rows = [] } = (await this.get(sql, args)) || {};

    return rows.map(toUserRecord);
  }
}

export function toUserRecord(record: Record<string, any>): UserRecord {
  const { id, active, name, region, role, password_hash, lead_id, lock_password, preferences } =
    record;

  return {
    id,
    name,
    region,
    role,
    password_hash,
    lead_id,
    active: Boolean(active),
    lock_password: Boolean(lock_password),
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

export function log(source: string, message: string | boolean | number): void {
  console.log(`\n==================${source}====================`);
  console.log(message);
}

export function logError(source: string, error: Error) {
  console.log(`\n==================${source}====================`);
  if (error instanceof LibsqlError) {
    console.log(`CODE: ${error.code}`);
  }
  console.log(error.stack);
  console.log(error.message);
}
export const db = new DatabaseController(getClient());
