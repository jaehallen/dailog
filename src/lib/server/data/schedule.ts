import type { ScheduleRecord, TimeEntryRecord } from '$lib/schema';
import { DEFAULT_MIN_WORKDATE } from '$lib/schema';
import { db } from '../database/db-controller';
import { env } from '$env/dynamic/private';
import { dateAtOffsetStr } from '$lib/utility';

export const getUserSchedule = async (
	userId: number
): Promise<{ startOfDuty: boolean; date_at: string } & ScheduleRecord> => {
	const { schedules, timeEntries } = await db.getUserEntryAndSched(userId, true, 10);
	return getSchedule(schedules, timeEntries);
};

export function getSchedule(schedules: ScheduleRecord[], timeEntries: TimeEntryRecord[]) {
	const clockEntry = timeEntries.find((entry) => entry.category === 'clock');
	const startOfDuty = isStartOfDuty(clockEntry);

	if (!schedules.length) {
		throw noSchedule();
	}

	if (!startOfDuty && clockEntry) {
		return {
			startOfDuty,
			date_at: clockEntry?.date_at,
			...scheduleByEntry(schedules, clockEntry)
		};
	}

	const latestSchedule = getCurrentSchedule(schedules);
	return {
		startOfDuty,
		date_at: dateAtOffsetStr(new Date(), latestSchedule.utc_offset),
		...latestSchedule
	};
}

export function isStartOfDuty(clockEntry: TimeEntryRecord | undefined): boolean {
	if (!clockEntry) return true;

	if (clockEntry.elapse_sec > (parseInt(env.MIN_WORKDATE_DIFF) || DEFAULT_MIN_WORKDATE) * 3600)
		return true;

	return false;
}

export function getCurrentSchedule(schedules: ScheduleRecord[] = []): ScheduleRecord {
	schedules.sort(
		(a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
	);

	const sched = schedules[0];
	if (!sched) {
		throw noSchedule();
	}

	return sched;
}

export function scheduleByEntry(schedules: ScheduleRecord[], clockEntry: TimeEntryRecord) {
	const sched = schedules.find((sched) => sched.id === clockEntry.sched_id);
	if (!sched) {
		throw noSchedule();
	}

	return sched;
}

function noSchedule(): Error {
	return new Error('User schedules is not properly configured.');
}
