<script lang="ts">
  import TextFilter from '$lib/component/Datatable/TextFilter.svelte';
  import BooleanRender from '$lib/component/Datatable/BooleanRender.svelte';
  import SelectFilter from '$lib/component/Datatable/SelectFilter.svelte';
  import Pagination from '$lib/component/Datatable/Pagination.svelte';
  import { FilterX, Filter } from 'lucide-svelte/icons';
  import { browser } from '$app/environment';
  import { matchFilter, textFilter } from '$lib/utility';
  import { createRender, createTable, Subscribe, Render } from 'svelte-headless-table';
  import { addColumnFilters, addResizedColumns } from 'svelte-headless-table/plugins';
  import { readable } from 'svelte/store';
  import type { PageData } from './$types';
  import FilterPanel from '$lib/component/Datatable/FilterDropdown.svelte';

  let advanceFilter = false;
  export let data: PageData;
  const table = createTable(readable(data.listOfUsers), {
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
    table.column({ header: 'Lead Id', accessor: 'lead_id' }),
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
  const { headerRows, rows, tableAttrs, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns);
  const { filterValues } = pluginStates.filter;
  $: hasFilter = Object.values($filterValues).filter((v) => v !== undefined && v !== '').length;
</script>

{#if browser}
  <main class="container">
    <div class="grid pb-0 mb-0">
      <div class="cell">
        <div class="cell">
          {#if advanceFilter}
            <FilterPanel />
          {/if}
        </div>
      </div>
      <div class="cell"></div>
      <div class="cell">
        <Pagination on:advfilter={() => (advanceFilter = !advanceFilter)}/>
      </div>
    </div>
    <table class="table is-hoverable is-fullwidth is-striped" {...$tableAttrs}>
      <thead class="block is-primary">
        {#each $headerRows as headerRow (headerRow.id)}
          <Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
            <tr {...rowAttrs}>
              <th
                >No.
                <div>
                  <button
                    class={`button is-small  + ${hasFilter ? 'is-link' : 'is-text'}`}
                    on:click={() => ($filterValues = {})}
                    ><span class="icon is-small">
                      <FilterX />
                    </span></button
                  >
                </div>
              </th>

              {#each headerRow.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                  <th {...attrs}>
                    <Render of={cell.render()} />
                    {#if props.filter?.render}
                      <div class="has-text-centered">
                        <Render of={props.filter?.render} />
                      </div>
                    {/if}
                  </th>
                </Subscribe>
              {/each}
            </tr>
          </Subscribe>
        {/each}
      </thead>
      <tbody {...$tableBodyAttrs}>
        {#each $rows as row, idx (row.id)}
          <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
            <tr
              class:has-background-danger-light={row.isData() && row.original.lock_password}
              {...rowAttrs}
            >
              <td>{idx + 1}</td>
              {#each row.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs>
                  <td {...attrs}>
                    <Render
                      of={cell.isData() && cell.value != null && cell.value != undefined
                        ? cell.render()
                        : '-'}
                    />
                  </td>
                </Subscribe>
              {/each}
            </tr>
          </Subscribe>
        {/each}
      </tbody>
    </table>
  </main>
{/if}

<style>
  table {
    border-collapse: separate;
  }

  thead {
    position: sticky;
    inset-block-start: 0;
    background: var(--bulma-scheme-main);
  }

  .filter-panel {
    width: 300px;
  }
</style>
