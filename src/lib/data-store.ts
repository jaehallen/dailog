import { derived, writable } from 'svelte/store';
import type { OptCategory, TimeEntryRecord, TimesheetStateInfo } from './schema';
import { CONFIRMCATEGORY } from './schema';

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
		message: '',
	});
	return {
		subscribe,
		set,
		start: (category: OptCategory) => {
			update((state) => {
				state.state = 'start';
				state.nextState = 'end';
				state.category = category;
				state.id = 0;
				state.confirm = true;
				state.message = CONFIRMCATEGORY[state.category][state.state]
				return state
			});
		},
		end: () => {
			update((state) => {
				state.state = 'end';
				state.nextState = 'start';
				state.message = CONFIRMCATEGORY[state.category][state.state]
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
				state.isBreak = state.nextState == 'end'
				state.confirm = false;
				state.message = '';

				if(!state.lunched && state.category == 'lunch'){
					state.lunched = true;
				}
				return state;
			});
		},
	}
}

export const timesheet = timesheetStore();
export const latestRecord = derived(timesheet, ($timesheet) => {
	const lastRecord = $timesheet?.reduce((latest: TimeEntryRecord, entry: TimeEntryRecord) => {
		if (entry.start_at > latest.start_at) {
			latest = { ...entry };
		}
		return latest;
	});
	return lastRecord;
});

export const lunchRecord = derived(timesheet, ($timesheet) => {
	const lunchEntry = $timesheet?.find((entry) => {
		return entry.category == 'lunch'
	});

	return lunchEntry || null;
});

export const timeAction = userTimeAction();