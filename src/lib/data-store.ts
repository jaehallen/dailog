import { derived, get, writable } from 'svelte/store';
import type { OptCategory, ScheduleRecord, TimeEntryRecord, TimesheetStateInfo } from './schema';
import { CONFIRMCATEGORY, TIMESHEETINFO } from './schema';
import { browser } from '$app/environment';
import { isEqual } from './utility';

export const timeAction = userTimeAction('user-action');
export const timesheet = timesheetStore('user-timesheet');

export const timeLog = derived(timesheet, ($timesheet) => {
	if (!$timesheet.length) return { clocked: null, lunch: null, lastBreak: null, endOfDay: false };

	const clocked = $timesheet.find((entry) => entry.category == 'clock') || null;
	const lunch = $timesheet.find((entry) => entry.category == 'lunch') || null;
	const last = $timesheet.reduce((latest: TimeEntryRecord, entry: TimeEntryRecord) => {
		if (entry.start_at > latest.start_at) {
			latest = { ...entry };
		}
		return latest;
	});

	const endOfDay = clocked && Boolean(clocked.start_at) == Boolean(clocked.end_at);

	return {
		clocked,
		lunch,
		lastBreak: last.category == 'clock' ? null : last,
		endOfDay
	};
});

function timesheetStore(key = 'user-timesheet') {
	const store = writable<TimeEntryRecord[]>([]);
	if (!browser) return { ...store, updateSheet: () => { } };

	const updateSheet = (data: TimeEntryRecord) =>
		store.update((entries) => {
			const idx = entries?.findIndex((e) => e.id == data.id);

			if (entries[idx]) {
				entries[idx].end_at = data.end_at;
			} else {
				const record = { ...data, end_at: null };
				entries.unshift(record);
			}

			return entries;
		});

	window.addEventListener('storage', (event) => {
		if (event.key == key) {
			let str = localStorage.getItem(key);
			if (str !== null && str !== undefined && !isEqual(JSON.parse(str), get(store))) {
				console.log('timesheet: storage event');
				store.set(JSON.parse(str));
			}
		}
	});

	const sync = (val: TimeEntryRecord[]) => {
		let localValue = localStorage.getItem(key);
		let storeValue = JSON.stringify(val);

		if (localValue != null && localValue != undefined && !isEqual(JSON.parse(localValue), val)) {
			console.log('timesheet: sync event');
			localStorage.setItem(key, storeValue);
		}
	};

	store.subscribe((val) => sync(val));

	return {
		subscribe: store.subscribe,
		set: store.set,
		updateSheet
	};
}

function userTimeAction(key = 'user-action') {
	const store = writable<TimesheetStateInfo>(TIMESHEETINFO);
	if (!browser)
		return {
			...store,
			validate: () => { },
			clockIn: () => { },
			clockOut: () => { },
			start: () => { },
			end: () => { },
			cancel: () => { },
			save: () => { }
		};

	const sync = (val: TimesheetStateInfo) => {
		let localValue = localStorage.getItem(key);
		let storeValue = JSON.stringify(val);

		if (localValue != null && localValue != undefined && !isEqual(JSON.parse(localValue), val)) {
			console.log('action: sync-event');
			localStorage.setItem(key, storeValue);
		}
	};

	store.subscribe((val) => sync(val));

	window.addEventListener('storage', (event) => {
		if (event.key == key) {
			let str = localStorage.getItem(key);
			if (str != null && str != undefined && !isEqual(JSON.parse(str), get(store))) {
				console.log('action: storage event');
				store.set(JSON.parse(str));
			}
		}
	});

	return {
		subscribe: store.subscribe,
		set: store.set,
		validate: (
			timelog: {
				clocked: TimeEntryRecord | null;
				lastBreak: TimeEntryRecord | null;
				lunch: TimeEntryRecord | null;
			},
			schedule: ScheduleRecord | null,
			date_at: string
		) => {
			store.update((state) => {
				const { clocked, lastBreak, lunch } = timelog;
				if (lastBreak) {
					state.isBreak = !Boolean(lastBreak.end_at);
					state.state = state.isBreak ? 'end' : 'start';
					state.nextState = state.isBreak ? 'start' : 'end';
					state.category = state.isBreak ? lastBreak.category : 'break';
					state.id = state.isBreak ? lastBreak.id : 0;
					state.timestamp = state.isBreak ? lastBreak.start_at : 0;
				}
				if (lunch) {
					state.lunched = lunch && Boolean(lunch.end_at);
				}

				if (clocked) {
					state.sched_id = clocked.sched_id;
				} else if (schedule) {
					state.sched_id = schedule.id;
				}

				if (schedule) {
					state.local_offset = schedule.local_offset;
				}

				state.date_at = date_at ? date_at : state.date_at;
				state.message = state.message;
				state.confirm = state.confirm;

				return state;
			});
		},
		clockIn: () => {
			store.update((state) => {
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
			store.update((state) => {
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
			store.update((state) => {
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
			store.update((state) => {
				state.state = 'end';
				state.nextState = 'start';
				state.message = CONFIRMCATEGORY[state.category][state.state];
				state.confirm = true;
				return state;
			});
		},
		cancel: () => {
			store.update((state) => {
				state.confirm = false;
				return state;
			});
		},
		save: (record: TimeEntryRecord) => {
			store.update((state) => {
				state.id = record.id;
				state.isBreak = state.nextState == 'end';
				state.confirm = false;
				state.message = '';
				state.timestamp = state.isBreak ? record.start_at : 0;

				if (!state.lunched && state.category == 'lunch') {
					state.lunched = true;
				}
				return state;
			});
		}
	};
}
