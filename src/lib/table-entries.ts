import type { Writable } from 'svelte/store';
import type { UserTimesheetReport } from './types/schema';
import { Text } from '$lib/component/Datatable';
import { writable } from 'svelte/store';
import { createRender, createTable } from 'svelte-headless-table';
import { formatDateOrTime, secToDuration } from './utility';
import type { User } from 'lucide-svelte';

export const entriesData = entriesStore();

export function getEntriesTable(data: Writable<UserTimesheetReport[]>) {
  const table = createTable(data);
  const columns = table.createColumns([
    table.column({
      header: 'Gaid',
      accessor: 'user_id',
      cell: ({ row, value }) => {
        return row.isData() && row.original.category != 'clock' ? '' : value;
      }
    }),
    table.column({
      header: 'Name',
      accessor: 'name',
      cell: ({ row, value }) => {
        return row.isData() && row.original.category != 'clock' ? '' : value;
      }
    }),
    table.column({
      header: 'Date',
      accessor: 'date_at',
      cell: ({ row, value }) => {
        return row.isData() && row.original.category != 'clock' ? '' : formatDateOrTime(value);
      }
    }),
    table.column({
      header: 'Clock In',
      accessor: 'clock_at',
      cell: ({ row, value }) => {
        return row.isData() && row.original.category != 'clock' ? '' : formatDateOrTime(value);
      }
    }),
    table.column({
      header: 'Category',
      accessor: 'category',
      cell: ({ value }) => createRender(Text, { text: value, typography: 'is-capitalized' })
    }),
    table.column({
      header: 'Start',
      accessor: 'start_at',
      cell: ({ value, row }) => {
        const offset = row.isData() ? row.original.local_offset : 8;
        const str = formatDateOrTime(new Date(Number(value) * 1000), true, offset, true);
        const isLate = row.isData() ? !onTime(row.original, str) : false;
        const typography = isLate ? 'is-italic has-text-danger' : '';
        return row.isData() && row.original.category == 'clock'
          ? createRender(Text, { text: str, typography })
          : str;
      }
    }),
    table.column({
      header: 'End',
      accessor: 'end_at',
      cell: ({ value, row }) => {
        const offset = row.isData() ? row.original.local_offset : 8;
        return formatDateOrTime(new Date(Number(value) * 1000), true, offset, true);
      }
    }),
    table.column({
      header: 'Duration',
      accessor: 'total_sec',
      cell: ({ value, row }) => {
        const text = secToDuration(value ?? 0)
        const overBreak = row.isData() ? isOverBreak(row.original) : false;
        const typography = overBreak ? 'is-italic has-text-danger' : '';
        return createRender(Text, { text, typography })
      }
    }),
    table.column({
      header: 'Remarks',
      accessor: 'remarks',
      cell: ({ value }) => {
        const str = String(value || '-')
          .replace('[start]', '🚀 ')
          .replace('[end]', '🏁 ');
        return createRender(Text, { text: str, typography: 'is-size-7 is-italic remarks' });
      }
    })
  ]);

  return table.createViewModel(columns, { rowDataId: (entry) => String(entry.id) });
}

function entriesStore() {
  const { subscribe, set, update } = writable<UserTimesheetReport[]>([]);
  const updateList = (newList: UserTimesheetReport[]) =>
    update((list) => {
      list = newList.toSorted((a, b) => {
        if (a.user_id == b.user_id) {
          return a.start_at - b.start_at;
        }

        return a.user_id - b.user_id;
      });
      return list;
    });

  return {
    updateList,
    subscribe,
    set,
    update
  };
}

function onTime(row: UserTimesheetReport, clockIn?: string) {
  const MAX_WORK = row.clock_dur_min ?? 540;
  const MIN_HOUR = (MAX_WORK - 23) * -60;
  const [ckHH, ckMM] = row.clock_at.split(':');
  const [hh, mm] = typeof clockIn == 'string' ? clockIn.split(":") : formatDateOrTime(new Date(Number(row.start_at) * 1000), true, row.local_offset, true).split(":")
  const clockTime = Math.round(parseInt(ckHH) * 60 + parseInt(ckMM));
  const loginTime = Math.round(parseInt(hh) * 60 + parseInt(mm));
  const diffHours = clockTime - loginTime;

  if (diffHours >= 0 && diffHours <= MAX_WORK) {
    return true;
  }
  if (MAX_WORK >= diffHours && diffHours <= MIN_HOUR) {
    return true;
  }

  return false;
}

function isOverBreak(row: UserTimesheetReport) {
  const totalBreakMin = Math.floor((row.total_sec || 0) / 60)
  if (row.category === 'break') {
    return row.break_dur_min && totalBreakMin > row.break_dur_min
  } else if (row.category === 'lunch') {
    return row.lunch_dur_min && totalBreakMin > row.lunch_dur_min
  }
  return false
}