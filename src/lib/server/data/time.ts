import { type TimeEntryRecord, type ScheduleRecord, type OptCategory } from '../database/schema';
import { toEpochDatetime, getTimeStr } from '$lib/utility';

function getTimeAdjustments(category: OptCategory, clock_at: string): number {
	if (category === 'clock') {
		return 0;
	}

	let timeStr = getTimeStr(new Date());
	let nowDatetime = toEpochDatetime(timeStr);
	let schedDatetime = toEpochDatetime(clock_at);
	return nowDatetime.getTime() - schedDatetime.getTime();
}

export function getWorkingDate(
	userSchedule: ScheduleRecord,
	lastTimeEntry: TimeEntryRecord
): string {
	const now = Date.now();
	let timeAdjustment = getTimeAdjustments(lastTimeEntry.category, userSchedule.clock_at);
	const datetime = new Date(now + userSchedule.utc_offset * 3600000 - timeAdjustment);
	const workDate = new Date(datetime.toDateString());
	const dateStr = workDate.toString().split('T', 1)[0];
	const lastWorkingDate = new Date(lastTimeEntry.date_at);

	if (!lastWorkingDate.getTime()) {
		return dateStr;
	}

	if (workDate > lastWorkingDate) {
		return dateStr;
	}

	return dateStr;
}