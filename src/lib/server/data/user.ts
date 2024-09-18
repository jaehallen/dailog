import { Argon2id } from 'oslo/password';
import { db } from '../database/db-controller';
import type { ScheduleRecord } from '../database/schema';
import { dateAtOffset } from '$lib/utility';

export const validateUser = async ({ id, password }: { id: number; password: string }) => {
	const argon2id = new Argon2id();
	const {
		user = null,
		schedules = [],
		timeEntries = null
	} = (await db.getUserLatestInfo(id)) || {};

	if (!user || !user.active) {
		return {user: null, schedule: null, timeEntry: null};
	}

	if (!(await argon2id.verify(user.password_hash, password))) {
		return {user: null, schedule: null, timeEntry: null};
	}

	const schedule = getCurrentSchedule(schedules || []);

	return { user, schedule, timeEntry: timeEntries };
};

function getCurrentSchedule(schedules: ScheduleRecord[] = []) {
	const today = new Date();
	schedules.sort(
		(a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
	);

	const currentSchedule = schedules.find((schedule) => {
		const scheduleDate = new Date(schedule.effective_date);
		const todayOffset = dateAtOffset(today, schedule.utc_offset);

		return todayOffset.getTime() >= scheduleDate.getTime();
	});

	return currentSchedule ?? null;
}
