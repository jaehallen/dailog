import type { UsersList, ScheduleRecord, UserRecord } from './types/schema';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { createRender, createTable } from 'svelte-headless-table';
import {
  addColumnFilters,
  addResizedColumns,
  addSelectedRows
} from 'svelte-headless-table/plugins';
import { SelectFilter, BooleanRender, TextFilter } from '$lib/component/Datatable';
import { textFilter, matchFilter, formatDateOrTime } from './utility';
import RowActionHeader from './component/Datatable/RowActionHeader.svelte';
import RowAction from './component/Datatable/RowAction.svelte';
import type { User } from 'lucia';

export const usersData = usersListStore();

export function getUsersTable(userslist: Writable<UsersList[]>, user: User | null = null) {
  const table = createTable(userslist, {
    filter: addColumnFilters(),
    resize: addResizedColumns(),
    select: addSelectedRows()
  });

  const columns = table.createColumns([
    table.display({
      id: 'rowAction',
      header: (
        _,
        {
          pluginStates: {
            filter: { filterValues },
            select
          }
        }
      ) => createRender(RowActionHeader, { filterValues, select }),
      cell: ({ row }, { pluginStates }) => {
        if (row.isData()) {
          const { allRowsSelected, getRowState } = pluginStates.select;
          const { isSelected } = getRowState(row);
          return createRender(RowAction, { data: row.original, user, isSelected, allRowsSelected });
        }
        return '-';
      },
      plugins: {
        resize: { initialWidth: 100, minWidth: 100 }
      }
    }),
    table.column({
      header: 'Active',
      accessor: 'active',
      cell: ({ value }) => createRender(BooleanRender, { value }),
      plugins: {
        filter: {
          fn: matchFilter,
          render: ({ filterValue, preFilteredValues }) =>
            createRender(SelectFilter, { filterValue, preFilteredValues })
        }
      }
    }),
    table.column({
      header: 'GAID',
      accessor: 'id',
      plugins: {
        resize: { initialWidth: 100, minWidth: 100 },
        filter: {
          fn: textFilter,
          initialFilterValue: '',
          render: ({ filterValue }) => createRender(TextFilter, { filterValue })
        }
      }
    }),
    table.column({
      header: 'Name',
      accessor: 'name',
      plugins: {
        filter: {
          fn: textFilter,
          initialFilterValue: '',
          render: ({ filterValue }) => createRender(TextFilter, { filterValue })
        }
      }
    }),
    table.column({
      header: 'Region',
      accessor: 'region',
      plugins: {
        filter: {
          fn: matchFilter,
          render: ({ filterValue, preFilteredValues }) =>
            createRender(SelectFilter, { filterValue, preFilteredValues })
        }
      }
    }),
    table.column({
      header: 'Role',
      accessor: 'role',
      plugins: {
        filter: {
          fn: matchFilter,
          render: ({ filterValue, preFilteredValues }) =>
            createRender(SelectFilter, { filterValue, preFilteredValues })
        }
      }
    }),
    table.column({
      header: 'Team Lead',
      accessor: 'teamlead',
      plugins: {
        filter: {
          fn: matchFilter,
          render: ({ filterValue, preFilteredValues }) =>
            createRender(SelectFilter, { filterValue, preFilteredValues })
        }
      }
    }),
    table.column({
      header: 'Lock',
      accessor: 'lock_password',
      cell: ({ value }) => createRender(BooleanRender, { value }),
      plugins: {
        filter: {
          fn: matchFilter,
          render: ({ filterValue, preFilteredValues }) =>
            createRender(SelectFilter, { filterValue, preFilteredValues })
        }
      }
    }),
    table.column({
      header: 'Latest Schedule',
      accessor: 'latest_schedule',
      cell: ({ value }) => formatDateOrTime(value)
    })
  ]);

  return table.createViewModel(columns, { rowDataId: (user) => String(user.id) });
}

function usersListStore() {
  const { set, update, subscribe } = writable<UsersList[]>([]);
  const updateSched = (scheds: ScheduleRecord[], schedule: ScheduleRecord) => {
    const idx = scheds.findIndex((s) => Number(s.id) === Number(schedule.id));
    if (idx >= 0) {
      scheds[idx] = { ...schedule };
    } else {
      scheds = [schedule, ...scheds]
        .toSorted(
          (a: ScheduleRecord, b: ScheduleRecord) =>
            new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
        )
        .slice(0, 5);
    }

    return scheds;
  };

  const addUserSched = (schedule: ScheduleRecord) => {
    update((lists) => {
      const idx = lists.findIndex((u) => u.id == schedule.user_id);

      if (idx >= 0) {
        lists[idx].schedules = updateSched([...lists[idx].schedules], schedule);
        lists[idx].latest_schedule = formatDateOrTime(lists[idx].schedules[0].effective_date);
        lists[idx].updated_at = new Date().toISOString();
      }
      return lists;
    });
  };

  const batchSched = (schedules: ScheduleRecord[]) => {
    update((lists) => {
      schedules.forEach((schedule) => {
        const idx = lists.findIndex((u) => u.id == schedule.user_id);
        if (idx >= 0) {
          lists[idx].schedules = updateSched([...lists[idx].schedules], schedule);
          lists[idx].latest_schedule = formatDateOrTime(lists[idx].schedules[0].effective_date);
          lists[idx].updated_at = new Date().toISOString();
        }
      });
      return lists;
    });
  };

  const updateUser = (
    updates: Omit<UserRecord, 'preferences'>,
    leads: { id: number; name: string }[]
  ) => {
    update((lists) => {
      const idx = lists.findIndex((u) => u.id == updates.id);
      if (idx) {
        let { lead_id, teamlead } = lists[idx];

        if (lead_id !== updates.lead_id) {
          const updatedLead = leads.find((l) => l.id === updates.lead_id)?.name;
          teamlead = updatedLead ?? teamlead;
          lead_id = updatedLead ? updates.lead_id : lead_id;
        }

        lists[idx] = {
          ...lists[idx],
          ...updates,
          lead_id,
          teamlead,
          updated_at: new Date().toISOString()
        };
      }
      return lists;
    });
  };
  return { set, update, subscribe, addUserSched, updateUser, batchSched };
}
