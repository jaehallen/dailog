import { Argon2id } from 'oslo/password';
import { db } from '../database/db-controller';
import type { ScheduleRecord } from '../database/schema';
import { dateAtOffset } from '$lib/utility';
import { startOfDay } from 'date-fns';

export const validateUser = async ({ id, password }: { id: number; password: string }) => {
	const argon2id = new Argon2id();
	const {
		user = null,
		schedules = [],
		timeEntries = null
	} = (await db.getUserLatestInfo(id)) || {};

	console.log(user, schedules, timeEntries);

	if (!user || !user.active) {
		return null;
	}

	if (!(await argon2id.verify(user.password_hash, password))) {
		return null;
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
		console.log(scheduleDate);
		console.log(startOfDay(todayOffset));
		return todayOffset >= scheduleDate;
	});

	console.log('==================>currentSchedule');
	console.log(currentSchedule);
	return currentSchedule;
}
