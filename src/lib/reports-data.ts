import { derived, writable } from 'svelte/store';
import type { ScheduleRecord, TimeEntryRecord, TimeEntryReport } from './schema';

export const timeReports = recordsStore();

function recordsStore() {
  const store = writable<TimeEntryReport[]>([]);
  const updateReports = (entries: TimeEntryRecord[], schedules: ScheduleRecord[]) =>
    store.update(() => {
      const sortedSchedule = schedules.toSorted(
        (a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
      );

      return entries
        .map((entry) => {
          const sched = sortedSchedule.find((s) => s.id == entry.sched_id) || sortedSchedule[0];
          return {
            ...entry,
            utc_offset: sched.utc_offset,
            local_offset: sched.local_offset,
            clock_at: sched.clock_at,
            effective_date: sched.effective_date
          };
        })
        .toSorted((a, b) => a.start_at - b.start_at);
    });

  return {
    subscribe: store.subscribe,
    set: store.set,
    updateReports
  };
}

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
