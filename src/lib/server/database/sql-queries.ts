import type { TimeEntryRecord, UserRecord } from '$lib/schema';

export const SQL_GET = {
	USER: `SELECT * FROM view_users WHERE id = $id`,
	USER_SCHEDULES: `SELECT * FROM view_schedules WHERE user_id = $user_id ORDER BY  effective_date DESC LIMIT $count`
};

export const SQL_SET = {
	CLOCKIN: `INSERT INTO time_entries (user_id, sched_id, category, date_at, start_at, user_ip, user_agent)
		VALUES ($user_id, $sched_id, $category, $date_at, $start_at, $user_ip, $user_agent) RETURNING *`,
	CLOCKOUT: `UPDATE time_entries SET end_at = $end_at WHERE id = $id RETURNING *`,
	BREAK_START: `INSERT INTO time_entries (user_id, sched_id, category, date_at, start_at)
	VALUES ($user_id, $sched_id, $category, $date_at, $start_at) RETURNING *`,
	BREAK_END: `UPDATE time_entries SET end_at = $end_at, user_ip = $user_ip, user_agent = $user_agent WHERE id = $id RETURNING *`,
	UPDATE_PASSWORD: `UPDATE users SET password_hash = $password_hash WHERE id = $id`
};

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
			// sql: `WITH last_entry AS
			// 				(SELECT id, user_id FROM time_entries WHERE user_id = $user_id AND category = 'clock' ORDER BY id DESC LIMIT 1)
			// 			SELECT te.* FROM time_entries te, last_entry l
			// 			WHERE te.user_id = l.user_id AND te.id >= l.id`,
			sql: `WITH last_entry AS 
							(SELECT MAX(id) as id, user_id FROM time_entries WHERE user_id = $user_id AND category = 'clock')
						SELECT te.* FROM time_entries te, last_entry l
						WHERE te.user_id = l.user_id AND te.id >= l.id`,
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
