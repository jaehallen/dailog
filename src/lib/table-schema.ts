import type { ScheduleRecord, TimeEntryRecord } from '$lib/schema';
import { formatDateOrTime } from '$lib/utility';

interface TableColumns<T> {
	title: string;
	key: keyof T;
	render: (
		val: string | number | boolean | undefined | null,
		option?: { local_offset: number }
	) => string | number;
}

export const timesheetColumn: TableColumns<TimeEntryRecord>[] = [
	{
		title: 'Date',
		key: 'date_at',
		render: (val) => {
			return formatDateOrTime(val as string);
		}
	},
	{
		title: 'Schedule ID',
		key: 'sched_id',
		render: (val) => {
			return val as number;
		}
	},
	{
		title: 'Type',
		key: 'category',
		render: (val) => {
			return `<span class="is-capitalized">${String(val)}</span>`;
		}
	},
	{
		title: 'Start At',
		key: 'start_at',
		render: (val, option) => {
			return formatDateOrTime(new Date(Number(val) * 1000), true, option?.local_offset || 8);
		}
	},
	{
		title: 'End At',
		key: 'end_at',
		render: (val, option) => {
			const sec = Number(val);
			return !sec ? '-' : formatDateOrTime(new Date(Number(sec) * 1000), true, option?.local_offset);
		}
	},

];
