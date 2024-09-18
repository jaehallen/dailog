import type { TimeEntryRecord, UserInfo } from '$lib/schema';
import type { Session } from 'lucia';
import { db } from '../database/db-controller';
import { env } from '$env/dynamic/private';
import { dateAtOffset } from '$lib/utility';

interface UserLatestTimedata extends Omit<UserInfo, 'user'> {
	startOfDuty: boolean;
	date_at: string;
}
export const userCurrentEntries = async (session: Session): Promise<UserLatestTimedata | null> => {
	const { schedules, timeEntries } = await db.getUserEntryAndSched(
		session.userId,
		session.sched_id
	);

	if (!timeEntries || !schedules) {
		return null;
	}

	const scheduledWorkDate = dateAtOffset(new Date(), schedules[0].utc_offset);
	const [dateStr] = scheduledWorkDate.toISOString().split('T', 1);

	const clockedData = timeEntries.find((entry: TimeEntryRecord) => entry.category === 'clock');
	const startOfDuty = clockedData ? isStartOfDuty(clockedData) : true;

	return {
		timeEntries,
		schedules,
		startOfDuty,
		date_at: startOfDuty || !clockedData ? dateStr : clockedData.date_at
	};
};

function isStartOfDuty(clockedData: TimeEntryRecord): boolean {
	if (clockedData.elapse_sec > parseInt(env.MIN_WORKDATE_DIFF || '20') * 3600) {
		return true;
	}

	return false;
}
