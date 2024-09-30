import type { TimeEntryRecord } from '$lib/schema';

export const QUERY = {
	USER: (args: { user_id: number }) => {
		return {
			sql: `SELECT * FROM view_users WHERE id = $user_id`,
			args
		};
	},
	USER_SCHEDULES: (args: { user_id: number; limit?: number }) => {
		return {
			sql: `SELECT 
				date(current_timestamp, CONCAT(utc_offset, ' hours')) as date_at, * 
				FROM schedules WHERE effective_date <= date_at AND user_id = $user_id
				ORDER BY effective_date DESC LIMIT $limit`,
			args: {
				user_id: args.user_id,
				limit: !args.limit ? 10 : args.limit
			}
		};
	},
	SCHEDULES: (args: { user_id: number; limit?: number }) => {
		return {
			sql: `SELECT * FROM view_schedules WHERE user_id = $user_id LIMIT $limit`,
			args: {
				user_id: args.user_id,
				limit: !args.limit ? 10 : args.limit
			}
		};
	},
	LAST_ENTRY: (args: { user_id: number }) => {
		return {
			sql: `WITH recent AS 
							(SELECT MAX(date_at) as date_at, user_id FROM time_entries WHERE user_id = $user_id AND category = 'clock')
						SELECT e.* FROM time_entries e, recent r 
						WHERE e.date_at = r.date_at and e.user_id = r.user_id`,
			args
		};
	},
	LAST_CLOCKED: (args: { user_id: number }) => {
		return {
			sql: `SELECT MAX(date_at) as max_date_at, * FROM time_entries WHERE user_id = $user_id AND category = 'clock'`,
			args
		};
	}
};

export const WRITE = {
	CLOCKIN: (args: Omit<TimeEntryRecord, 'id' | 'end_at' | 'elapse_sec'>) => {
		return {
			sql: `INSERT INTO time_entries (user_id, sched_id, category, date_at, start_at, user_ip, user_agent)
				VALUES ($user_id, $sched_id, $category, $date_at, $start_at, $user_ip, $user_agent) RETURNING *`,
			args
		};
	},
	CLOCKOUT: (args: Pick<TimeEntryRecord, 'id' | 'end_at'>) => {
		return {
			sql: `UPDATE time_entries SET end_at = $end_at WHERE id = $id RETURNING *`,
			args
		};
	},
	BREAK_START: (
		args: Pick<TimeEntryRecord, 'user_id' | 'sched_id' | 'category' | 'date_at' | 'start_at'>
	) => {
		return {
			sql: `INSERT INTO time_entries (user_id, sched_id, category, date_at, start_at)
				VALUES ($user_id, $sched_id, $category, $date_at, $start_at) RETURNING *`,
			args
		};
	},
	BREAK_END: (args: Pick<TimeEntryRecord, 'id' | 'end_at' | 'user_ip' | 'user_agent'>) => {
		return {
			sql: `UPDATE time_entries SET end_at = $end_at, user_ip = $user_ip, user_agent = $user_agent WHERE id = $id RETURNING *`,
			args
		};
	},
	UPDATE_PASSWORD: (args: { user_id: number; password_hash: string }) => {
		return {
			sql: `UPDATE users SET password_hash = $password_hash WHERE id = $user_id`,
			args
		};
	}
};
