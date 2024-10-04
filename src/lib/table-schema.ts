import type { ScheduleRecord, TimeEntryRecord } from '$lib/schema';
import { formatDateOrTime, getOffsetTimezoneStr, minToDuration } from '$lib/utility';

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
			return !sec
				? '-'
				: formatDateOrTime(new Date(Number(sec) * 1000), true, option?.local_offset);
		}
	}
];

export const scheduleColumn: TableColumns<ScheduleRecord>[] = [
	{
		title: 'Schedule ID',
		key: 'id',
		render: (val) => {
			if (!val) return '-';

			return val as number;
		}
	},
	{
		title: 'Effective Date',
		key: 'effective_date',
		render: (val) => {
			return formatDateOrTime(val as string);
		}
	},
	{
		title: 'Client Timezone',
		key: 'utc_offset',
		render: (val) => {
			return getOffsetTimezoneStr(val as number);
		}
	},
	{
		title: 'Clock In',
		key: 'clock_at',
		render: (val) => {
			return formatDateOrTime(val as string);
		}
	},
	{
		title: 'First Break',
		key: 'first_break_at',
		render: (val) => {
			return formatDateOrTime(val as string);
		}
	},
	{
		title: 'Lunch Break',
		key: 'lunch_at',
		render: (val) => {
			return formatDateOrTime(val as string);
		}
	},
	{
		title: 'Second Break',
		key: 'second_break_at',
		render: (val) => {
			return formatDateOrTime(val as string);
		}
	},
	{
		title: 'Work Duration',
		key: 'clock_dur_min',
		render: (val) => {
			return minToDuration(val as number);
		}
	},
	{
		title: 'Break Duration',
		key: 'break_dur_min',
		render: (val) => {
			return minToDuration(val as number);
		}
	},
	{
		title: 'Lunch Duration',
		key: 'lunch_dur_min',
		render: (val) => {
			return minToDuration(val as number);
		}
	},
	{
		title: 'Day Off',
		key: 'day_off',
		render: (val) => {
			let days = String(val).split(",")
			if(days.length){
				return days.map((day) => {
					return `<strong class="is-capitalized">${String(day)}</strong>`
				}).join("<strong>, </strong>")
			}

			return "-"
		}
	}
];

