import type { ScheduleRecord, TimeEntryRecord, UserInfo } from '$lib/schema';
import type { Session } from 'lucia';
import { db } from '../database/db-controller';
import { env } from '$env/dynamic/private';
import { dateAtOffset } from '$lib/utility';

interface UserLatestTimedata extends Omit<UserInfo, 'user'> {
	startOfDuty: boolean;
	date_at: string;
}

export const userDutyInfo = (schedule: ScheduleRecord, timeEntries: TimeEntryRecord[] | TimeEntryRecord) => {
	const [dateStr] = dateAtOffset(new Date(), schedule.utc_offset).toISOString().split('T', 1);
	const clockedEntry = Array.isArray(timeEntries) ? timeEntries.find((entry: TimeEntryRecord) => entry.category === 'clock') : timeEntries;
	const startOfDuty = isStartOfDuty(clockedEntry || timeEntries)
	const date_at = startOfDuty || !clockedEntry ? dateStr : clockedEntry.date_at;

	return {
		startOfDuty,
		date_at,
	};
}

export const userCurrentEntries = async (session: Session): Promise<UserLatestTimedata | null> => {
	const { schedules, timeEntries } = await db.getUserEntryAndSched(
		session.userId,
		session.sched_id
	);

	if (!timeEntries || !schedules) {
		return null;
	}
	const [schedule] = schedules;
	const {startOfDuty, date_at} = userDutyInfo(schedule, timeEntries);

	return {
		timeEntries,
		schedules,
		startOfDuty,
		date_at,
	};
};

export function getCurrentSchedule(schedules: ScheduleRecord[] = []) {
	schedules.sort(
		(a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
	);

	const currentSchedule = schedules.find((schedule) => {
		const scheduleDate = new Date(schedule.effective_date);
		const todayOffset = dateAtOffset(new Date(), schedule.utc_offset);

		return todayOffset.getTime() >= scheduleDate.getTime();
	});

	return currentSchedule ?? null;
}

export function isStartOfDuty(timeEntries: TimeEntryRecord[] | TimeEntryRecord): boolean {
	const clockedData = Array.isArray(timeEntries) 
	? timeEntries.find((entry: TimeEntryRecord) => entry.category === 'clock')
	: timeEntries

	if(!clockedData){
		return true;
	}

	if (clockedData.elapse_sec > parseInt(env.MIN_WORKDATE_DIFF || '20') * 3600) {
		return true;
	}

	return false;
}


