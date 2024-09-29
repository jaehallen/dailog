import type { OptActionState, ScheduleRecord, TimeEntryRecord } from '$lib/schema';
import { DEFAULT_MIN_WORKDATE } from '$lib/schema';
import type { Session } from 'lucia';
import { db } from '../database/db-controller';
import { env } from '$env/dynamic/private';
import { dateAtOffset } from '$lib/utility';

interface UserLatestTimedata {
	schedule: ScheduleRecord;
	timeEntries: TimeEntryRecord[];
	startOfDuty: boolean;
	date_at: string;
}

export const postTime = async (
	data: Omit<TimeEntryRecord, 'start_at' | 'end_at' | 'elapse_sec'> & {
		timestamp: number;
		timeAction: OptActionState;
	}
) => {
	if (data.category == 'clock') {
		if (data.timeAction == 'start') {
			return await db.clockIn({
				user_id: data.user_id,
				category: data.category,
				date_at: data.date_at,
				sched_id: data.sched_id,
				user_ip: data.user_ip,
				user_agent: data.user_agent,
				start_at: data.timestamp
			});
		} else {
			return await db.clockOut({
				id: data.id,
				end_at: data.timestamp
			});
		}
	} else {
		if (data.timeAction == 'start') {
			return await db.startTime({
				user_id: data.user_id,
				category: data.category,
				date_at: data.date_at,
				sched_id: data.sched_id,
				start_at: data.timestamp
			});
		} else {
			return await db.endTime({
				id: data.id,
				end_at: data.timestamp,
				user_ip: data.user_ip,
				user_agent: data.user_agent
			});
		}
	}
};

export const userCurrentEntries = async (session: Session): Promise<UserLatestTimedata | null> => {
	const { schedules, timeEntries } = await db.getUserEntryAndSched(session.userId);

	const [schedule] = schedules;
	const { startOfDuty, date_at } = userDutyInfo(schedule, timeEntries);

	return {
		timeEntries,
		schedule,
		startOfDuty,
		date_at
	};
};

export function userDutyInfo(schedule: ScheduleRecord, timeEntries: TimeEntryRecord[]) {
	const lastClockEntry = getLatestClock(timeEntries) || null;
	const startOfDuty = !lastClockEntry ? true : isStartOfDuty(lastClockEntry);

	if (!startOfDuty && lastClockEntry) {
		return {
			startOfDuty,
			date_at: lastClockEntry.date_at
		};
	}

	const [dateStr] = dateAtOffset(new Date(), schedule.utc_offset).toISOString().split('T', 1);

	return {
		startOfDuty,
		date_at: dateStr
	};
}

function getLatestClock(timeEntries: TimeEntryRecord[]): TimeEntryRecord | undefined {
	return timeEntries.find((entry: TimeEntryRecord) => entry.category === 'clock');
}

export function isStartOfDuty(clockEntry: TimeEntryRecord): boolean {
	if (clockEntry.category !== 'clock') return true;

	if (clockEntry.elapse_sec > (parseInt(env.MIN_WORKDATE_DIFF) || DEFAULT_MIN_WORKDATE) * 3600)
		return true;

	return false;
}
