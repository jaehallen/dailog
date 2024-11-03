import { derived, writable } from 'svelte/store';
import type { TimeEntryReport } from './types/schema';

export const timeReports = recordsStore();
export const recordInfo = derived(timeReports, ($userReport) => {
  let dates = $userReport.map((entry) => new Date(entry.date_at).getTime());
  let startOfWeek = Math.min(...dates);
  let endOfWeek = Math.max(...dates);

  return {
    startOfWeek,
    endOfWeek,
    dates
  };
});

function recordsStore() {
  const store = writable<TimeEntryReport[]>([]);
  const updateReports = (timesheet: TimeEntryReport[]) =>
    store.update(() => {
      return timesheet.toSorted((a, b) =>
        a.effective_date != b.effective_date
          ? new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime()
          : a.start_at - b.start_at
      );
    });

  return {
    subscribe: store.subscribe,
    set: store.set,
    updateReports
  };
}
