export const SQL_GET = {
	USER: `SELECT * FROM view_users WHERE id = $id`,
	USER_SCHEDULES: `SELECT * FROM view_schedules WHERE user_id = $userId ORDER BY  effective_date DESC LIMIT $count`
};

export const SQL_SET = {
	CLOCKIN: `INSERT INTO time_entries (user_id, sched_id, category, date_at, start_at, user_ip, user_agent)
		VALUES ($user_id, $sched_id, $category, $date_at, $start_at, $user_ip, $user_agent) RETURNING *`,
	CLOCKOUT: `UPDATE time_entries SET end_at = $end_at WHERE id = $id RETURNING *`,
	BREAK_START: `INSERT INTO time_entries (user_id, sched_id, category, date_at, start_at)
	VALUES ($user_id, $sched_id, $category, $date_at, $start_at) RETURNING *`,
	BREAK_END: `UPDATE time_entries SET end_at = $end_at, user_ip = $user_ip, user_agent = $user_agent WHERE id = $id RETURNING *`
};

