import { LibsqlError, type Client, type InStatement, type ResultSet } from '@libsql/client';
import type { ScheduleRecord, TimeEntryRecord, UserInfo, UserRecord } from './schema';
import { SQL_GET } from './sql-queries';
import { dbChild } from './turso';
import { intlFormat } from '$lib/utility';

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
                console.log(error.message);
            }
        }

        return null;
    }

    private async batchGet(querries: InStatement[]): Promise<ResultSet[] | null> {
        try {
            const results = await this.client.batch(querries, 'read');
            return results;
        } catch (error) {
            if (error instanceof LibsqlError) {
                console.log(error.message);
            }
        }

        return null;
    }

    public async getUser(id: number): Promise<UserRecord | null> {
        const { rows = [] } = (await this.get(SQL_GET.USER, { id })) || {};

        if (!rows.length) {
            return null;
        }

        return toUserRecord(rows[0]);
    }

    public async getInitInfo(userId: number): Promise<UserInfo | null> {
        const [{ rows: userData = [] }, { rows: userSched = [] }, { rows: timeData = [] }] =
            (await this.batchGet([
                { sql: `SELECT id, password_hash, active FROM users WHERE id = $id`, args: { id: userId } },
                { sql: `SELECT * FROM schedules WHERE user_id = $id`, args: { id: userId } },
                { sql: `SELECT * FROM time_entries WHERE user_id = $id`, args: { id: userId } }
            ])) || [];

        const [user] = userData;
        const [schedule] = userSched;
        const [timeEntries] = timeData;

        return {
            user: user ? toUserRecord(user) : null,
            schedule: schedule ? toUserScheddule(schedule) : null,
            timeEntries: timeEntries ? toTimeEntryRecord(timeEntries) : null
        };
    }

    public async getTimeEntry(userId: number): Promise<Omit<UserInfo, 'user'> | null> {
        const { rows = [] } = (await this.get(SQL_GET.TIME_SCHED_ENTRY, { id: userId })) || {};
        if (!rows.length) {
            return null;
        }
        const schedule = toUserScheddule(rows[0]);
        const timeEntries = toTimeEntryRecord(rows[0]);

        return { schedule, timeEntries };
    }
}
function toUserRecord(record: Record<string, any>): UserRecord {
    const { id, active, name, region, role, password_hash, lead_id, lock_password } = record;

    return {
        id,
        name,
        region,
        role,
        password_hash,
        lead_id,
        active: Boolean(active),
        lock_password: Boolean(lock_password)
    };
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
        created_at
    } = record;

    return {
        id: id ? id : sched_id,
        user_id,
        effective_date: intlFormat<ScheduleRecord>(effective_date),
        utc_offset,
        local_offset,
        clock_dur_min,
        lunch_dur_min,
        break_dur_min,
        clock_at: intlFormat<ScheduleRecord>(clock_at),
        first_break_at: intlFormat<ScheduleRecord>(first_break_at),
        lunch_at: intlFormat<ScheduleRecord>(lunch_at),
        second_break_at: intlFormat<ScheduleRecord>(second_break_at),
        created_at
    };
}

function toTimeEntryRecord(record: Record<string, any>) {
    const { id, user_id, sched_id, category, utc_offset, date_at, set_at, start_at, end_at } = record;

    return {
        id,
        user_id,
        sched_id,
        category,
        utc_offset,
        date_at: intlFormat<TimeEntryRecord>(date_at),
        set_at: intlFormat<TimeEntryRecord>(set_at),
        start_at,
        end_at
    };
}
export const db = new DatabaseController(dbChild());
