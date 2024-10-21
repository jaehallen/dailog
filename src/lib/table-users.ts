import type { UsersList, ScheduleRecord, UserRecord } from './types/schema';
import type { Writable } from 'svelte/store';
import {writable} from 'svelte/store'
import { createRender, createTable } from 'svelte-headless-table';
import { addColumnFilters, addResizedColumns } from 'svelte-headless-table/plugins';
import { SelectFilter, BooleanRender, TextFilter } from '$lib/component/Datatable';
import { textFilter, matchFilter } from './utility';

export const usersData = usersListStore();

export function getUsersTable(userslist: Writable<UsersList[]>) {
  const table = createTable(userslist, {
    filter: addColumnFilters(),
    resize: addResizedColumns()
  });

  const columns = table.createColumns([
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
      header: 'Lock Password',
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
    table.column({ header: 'Latest Schedule', accessor: 'latest_schedule' })
  ]);

  return table.createViewModel(columns);
}

function usersListStore() {
  const { set, update, subscribe } = writable<UsersList[]>([]);
  const addUserSched = (schedule: ScheduleRecord) => {
    update((lists) => {
      const idx = lists.findIndex((u) => u.id == schedule.user_id);
      if (idx) {
        const scheds = lists[idx].schedules
        const schedIdx = scheds.findIndex(s => Number(s.id) === Number(schedule.id))

        if(schedIdx != undefined){
          scheds[schedIdx] = {...schedule}
          lists[idx].schedules = [...scheds]
        }else{
          lists[idx].schedules = [schedule, ...scheds.slice(0, 4)]
        }
      }
      return lists;
    });
  }

  const updateUser = (updates : UserRecord) => {
    update((lists) => {
      const idx = lists.findIndex((u) => u.id == updates.id);
      if (idx) {
        const {id, password_hash, ...rest} = updates
        lists[idx] = {...lists[idx], ...rest}
      }
      return lists;
    });
  }
  return { set, update, subscribe, addUserSched, updateUser };
}