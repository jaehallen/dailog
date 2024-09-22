import { writable } from 'svelte/store';
import type { TimeEntryRecord } from './schema';

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

export const timesheet = timesheetStore();
