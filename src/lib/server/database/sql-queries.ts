export const SQL_GET = {
	USER_SESSION: `SELECT s.id, s.user_id, s.expires_at,
				u.active, u.name, u.region, u.role, u.password_hash, u.lead_id, u.lock_password FROM users u
					INNER JOIN sessions s ON s.user_id = u.id
				WHERE s.id = $id`,
	USER: `SELECT id, active, name, region, role, password_hash, lead_id, lock_password FROM users WHERE id = $id`,
	TIME_SCHED_ENTRY: `SELECT te.id, te.sched_id, te.category, te.date_at, te.set_at, te.start_at, te.end_at,
		sched.utc_offset, sched.local_offset, sched.clock_at, sched.effective_date
		FROM time_entries te
		LEFT JOIN schedules sched ON te.sched_id = sched.id
		WHERE te.user_id = $id`
};
