export const SQL_GET = {
	USER: `SELECT * FROM view_users WHERE id = $id`,
	TIME_SCHED_ENTRY: `SELECT te.id, te.sched_id, te.category, te.date_at, te.set_at, te.start_at, te.end_at,
		sched.utc_offset, sched.local_offset, sched.clock_at, sched.effective_date
		FROM time_entries te
		LEFT JOIN schedules sched ON te.sched_id = sched.id
		WHERE te.user_id = $id`,
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