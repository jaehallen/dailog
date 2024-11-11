import type { Writable } from 'svelte/store';
import type { UserTimesheetReport } from './types/schema';
import { Text } from '$lib/component/Datatable';
import { writable } from 'svelte/store';
import { createRender, createTable } from 'svelte-headless-table';
import { formatDateOrTime, secToDuration } from './utility';

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
        // const isLate = row.isData() ? !onTime(row.original) : false;
        const isLate = false;
        const typography = isLate ? 'is-italic is-danger' : '';
        const str = formatDateOrTime(new Date(Number(value) * 1000), true, offset, true);
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
      cell: ({ value }) => secToDuration(value ?? 0)
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

function onTime(row: UserTimesheetReport) {
  const MAX_WORK = row.clock_dur_min ?? 540;
  const MIN_HOUR = (MAX_WORK - 23) * -60;
  const [ckHH, ckMM] = row.clock_at.split(':');
  const [_, time] = new Date(row.start_at * 1000).toISOString().split('T');
  const [hh, mm, ss] = time.split(':');
  const clockTime = Math.round(parseInt(ckHH) * 60 + parseInt(ckMM));
  const loginTime = Math.round(parseInt(hh) * 60 + parseInt(mm) + parseInt(ss) / 60);
  const diffHours = loginTime - clockTime;
  console.log(row.clock_at, clockTime, loginTime);
  console.log(diffHours, MAX_WORK, MIN_HOUR);

  if (diffHours >= 0 && diffHours <= MAX_WORK) {
    return true;
  }
  if (MAX_WORK >= diffHours && diffHours <= MIN_HOUR) {
    return true;
  }

  return false;
}
