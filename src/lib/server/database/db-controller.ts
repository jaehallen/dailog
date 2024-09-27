import type { Client, InStatement, ResultSet } from '@libsql/client';
import type {
	ScheduleRecord,
	TimeEntryRecord,
	UserInfo,
	UserProfile,
	UserRecord
} from '$lib/schema';
import { LibsqlError } from '@libsql/client';
import { SQL_GET, SQL_SET } from './sql-queries';
import { dbChild } from './turso';

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
		const { rows = [] } = (await this.get(SQL_GET.USER, { id })) || {};

		if (!rows.length) {
			return null;
		}

		return toUserRecord(rows[0]);
	}

	public async getUserLatestInfo(userId: number): Promise<UserInfo | null> {
		const results = await this.batchGet([
			{ sql: `SELECT id, active, password_hash FROM users WHERE id = $id`, args: { id: userId } },
			{
				sql: `SELECT * FROM view_schedules WHERE user_id = $id ORDER BY id DESC LIMIT 3`,
				args: { id: userId }
			},
			{
				sql: `SELECT *, MAX(date_at) FROM view_time_entries WHERE category = 'clock' AND user_id = $id`,
				args: { id: userId }
			}
		]);

		const [
			{ rows: userData = [] } = {},
			{ rows: userSched = [] } = {},
			{ rows: timeData = [] } = {}
		] = results || [];

		return {
			user: userData.length ? toUserRecord(userData[0]) : null,
			schedules: userSched ? userSched.map(toUserScheddule) : [],
			timeEntries: timeData ? timeData.map(toTimeEntryRecord) : []
		};
	}

	public async getUserEntryAndSched(
		userId: number,
		schedId: number
	): Promise<Omit<UserInfo, 'user'>> {
		const results = await this.batchGet([
			{
				sql: `SELECT * FROM view_schedules WHERE id = $sid`,
				args: { sid: schedId }
			},
			{
				sql: `SELECT *, MAX(date_at) FROM view_time_entries WHERE user_id = $id GROUP BY category`,
				args: { id: userId }
			}
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
			{
				sql: SQL_GET.USER,
				args: { id: userId }
			},
			{
				sql: SQL_GET.USER_SCHEDULES,
				args: { userId: userId, count: schedule_count }
			}
		]);

		const [{ rows: userData = [] } = {}, { rows: userSchedules = [] } = {}] = results || [];

		return {
			user: userData.length ? toUserProfile(userData[0]) : null,
			schedules: userSchedules ? userSchedules.map(toUserScheddule) : []
		};
	}

	public async clockIn(args: Omit<TimeEntryRecord, 'id' | 'end_at' | 'elapse_sec'>) {
		const results = await this.set(SQL_SET.CLOCKIN, args);
		if (!results) return null;
		return toTimeEntryRecord(results.rows[0]);
	}

	public async clockOut(args: Pick<TimeEntryRecord, 'id' | 'end_at'>) {
		const results = await this.set(SQL_SET.CLOCKOUT, args);
		if (!results) return null;
		return toTimeEntryRecord(results.rows[0]);
	}

	public async startTime(
		args: Omit<TimeEntryRecord, 'id' | 'end_at' | 'elapse_sec' | 'user_ip' | 'user_agent'>
	) {
		const results = await this.set(SQL_SET.BREAK_START, args);
		if (!results) return null;
		return toTimeEntryRecord(results.rows[0]);
	}

	public async endTime(args: Pick<TimeEntryRecord, 'id' | 'end_at' | 'user_ip' | 'user_agent'>) {
		const results = await this.set(SQL_SET.BREAK_END, args);
		if (!results) return null;
		return toTimeEntryRecord(results.rows[0]);
	}

	public async updatePassword(userId: number, password: string) {
		const results = await this.set(SQL_SET.UPDATE_PASSWORD, { id: userId, password_hash: password });
		
		if (!results) return null;
		return results.rowsAffected > 0
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
		created_at
	};
}

function toTimeEntryRecord(record: Record<string, any>) {
	const { id, user_id, sched_id, category, date_at, start_at, end_at } = record || {};

	return {
		id,
		user_id,
		sched_id,
		category,
		date_at,
		start_at,
		end_at,
		elapse_sec: Math.floor(Date.now() / 1000) - start_at
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
export const db = new DatabaseController(dbChild());
