import { derived, writable } from 'svelte/store';
import type { OptCategory, TimeEntryRecord, TimesheetStateInfo } from './schema';
import { CONFIRMCATEGORY } from './schema';

export const timeAction = userTimeAction();
export const timesheet = timesheetStore();

export const timeLog = derived(timesheet, ($timesheet) => {
	if (!$timesheet.length) return {};
	const clocked = $timesheet?.find((entry) => entry.category == 'clock') || null;
	const lunch = $timesheet?.find((entry) => entry.category == 'lunch') || null;
	const last = $timesheet?.reduce((latest: TimeEntryRecord, entry: TimeEntryRecord) => {
		if (entry.start_at > latest.start_at) {
			latest = { ...entry };
		}
		return latest;
	});

	const endOfDay = clocked && Boolean(clocked.start_at) == Boolean(clocked.end_at);

	return {
		clocked,
		lunch,
		last,
		endOfDay
	};
});

function timesheetStore() {
	const { subscribe, set, update } = writable<TimeEntryRecord[]>([]);
	return {
		subscribe,
		set,
		updateSheet: (data: TimeEntryRecord) =>
			update((entries) => {
				const idx = entries?.findIndex((e) => e.id == data.id);

				if (entries[idx]) {
					entries[idx].end_at = data.end_at;
				} else {
					const record = { ...data, end_at: null };
					entries.unshift(record);
				}

				return entries;
			})
	};
}

function userTimeAction() {
	const { subscribe, set, update } = writable<TimesheetStateInfo>({
		confirm: false,
		state: 'end',
		nextState: 'start',
		category: 'break',
		date_at: '',
		isBreak: false,
		id: 0,
		timestamp: 0,
		lunched: false,
		message: ''
	});
	return {
		subscribe,
		set,
		clockIn: () => {
			update((state) => {
				state.state = 'start';
				state.nextState = 'start';
				state.category = 'clock';
				state.id = 0;
				state.message = CONFIRMCATEGORY[state.category][state.state];
				state.confirm = true;

				return state;
			});
		},
		clockOut: (clockId: number) => {
			update((state) => {
				state.state = 'end';
				state.nextState = 'start';
				state.category = 'clock';
				state.id = clockId;
				state.message = CONFIRMCATEGORY[state.category][state.state];
				state.confirm = true;
				return state;
			});
		},
		start: (category: OptCategory) => {
			update((state) => {
				state.state = 'start';
				state.nextState = 'end';
				state.category = category;
				state.id = 0;
				state.message = CONFIRMCATEGORY[state.category][state.state];
				state.confirm = true;
				return state;
			});
		},
		end: () => {
			update((state) => {
				state.state = 'end';
				state.nextState = 'start';
				state.message = CONFIRMCATEGORY[state.category][state.state];
				state.confirm = true;
				return state;
			});
		},
		close: () => {
			update((state) => {
				state.confirm = false;
				return state;
			});
		},
		save: (id: number) => {
			update((state) => {
				state.id = id;
				state.isBreak = state.nextState == 'end';
				state.confirm = false;
				state.message = '';

				if (!state.lunched && state.category == 'lunch') {
					state.lunched = true;
				}
				return state;
			});
		}
	};
}
