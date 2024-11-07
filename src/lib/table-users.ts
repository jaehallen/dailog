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
import { RowAction, RowActionHeader } from '$lib/component/Datatable';
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

  const batchUpdateUser = (listOfUsers: UserRecord[], leads: { id: number; name: string }[]) =>
    update((lists) => {
      listOfUsers.forEach((user) => {
        const idx = lists.findIndex((list) => list.id == user.id);
        if (idx >= 0) {
          lists[idx] = updatedVal(user, lists[idx], leads);
        }
      });

      return lists;
    });

  const updatedVal = (user: UserRecord, old: UsersList, leads: { id: number; name: string }[]) => {
    const val = Object.fromEntries(Object.entries(user).filter(([_, v]) => v != undefined));
    let { lead_id, teamlead } = old;

    if (lead_id !== val.lead_id && val.lead_id) {
      const newLead = leads.find((l) => l.id == val.lead_id)?.name;
      teamlead = newLead ?? teamlead;
      lead_id = newLead ? val.lead_id : lead_id;
    }

    return {
      ...old,
      ...val,
      lead_id,
      teamlead,
      updated_at: new Date().toISOString()
    };
  };

  const updateUser = (updates: UserRecord, leads: { id: number; name: string }[]) => {
    update((lists) => {
      const idx = lists.findIndex((u) => u.id == updates.id);
      if (idx >= 0) {
        lists[idx] = updatedVal(updates, lists[idx], leads);
      }
      return lists;
    });
  };
  return { set, update, subscribe, addUserSched, updateUser, batchSched, batchUpdateUser };
}
