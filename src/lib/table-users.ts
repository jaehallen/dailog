import { createRender, createTable } from 'svelte-headless-table';
import { addColumnFilters, addResizedColumns } from 'svelte-headless-table/plugins';
import type { UsersList } from './types/schema';
import type { Readable } from 'svelte/store';
import { SelectFilter, BooleanRender, TextFilter } from '$lib/component/Datatable';
import { textFilter, matchFilter } from './utility';

export function getUsersTable(userslist: Readable<UsersList[]>) {
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
