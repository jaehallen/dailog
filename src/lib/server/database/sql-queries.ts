export const SQL_GET = {
	USER: `SELECT * FROM view_users WHERE id = $id`,
	TIME_SCHED_ENTRY: `SELECT te.id, te.sched_id, te.category, te.date_at, te.set_at, te.start_at, te.end_at,
		sched.utc_offset, sched.local_offset, sched.clock_at, sched.effective_date
		FROM time_entries te
		LEFT JOIN schedules sched ON te.sched_id = sched.id
		WHERE te.user_id = $id`
};
