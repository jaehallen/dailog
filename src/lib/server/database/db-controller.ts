import { LibsqlError, type Client, type InStatement, type ResultSet } from '@libsql/client';
import type { UserInfo, UserRecord } from './schema';
import { SQL_GET } from './sql-queries';
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
				logError("get", error as Error)
			}
		}

		return null;
	}

	private async batchGet(querries: InStatement[]): Promise<ResultSet[] | null> {
		try {
			const results = await this.client.batch(querries, 'read');
			return results;
		} catch (error: unknown) {
        logError("batchGet", error as Error)
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

		const [user] = userData;
		const [timeEntries] = timeData;

		return {
			user: user ? toUserRecord(user) : null,
			schedules: userSched ? userSched.map(toUserScheddule) : null,
			timeEntries: timeEntries ? toTimeEntryRecord(timeEntries) : null
		};
	}

	// public async getTimeEntry(userId: number): Promise<Omit<UserInfo, 'user'> | null> {
	//     const { rows = [] } = (await this.get(SQL_GET.TIME_SCHED_ENTRY, { id: userId })) || {};
	//     if (!rows.length) {
	//         return null;
	//     }
	//     const schedule = toUserScheddule(rows[0]);
	//     const timeEntries = toTimeEntryRecord(rows[0]);

	//     return { schedules, timeEntries };
	// }
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
	const { id, user_id, sched_id, category, date_at, start_at, end_at } = record;

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

export function log(source: string, message: string): void{
  console.log(`\n==================${source}====================`);
  console.log()
}

export function logError(source: string, error: Error){
  console.log(`\n==================${source}====================`);
  if(error instanceof LibsqlError){
    console.log(`CODE: ${error.code}`)
  }
  console.log(error.message);
}
export const db = new DatabaseController(dbChild());
