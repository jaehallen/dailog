<script lang="ts">
  import { slide } from 'svelte/transition';
  import { quintInOut } from 'svelte/easing';
  import { Pagination, FilterDropdown as FilterPanel, SearchUser } from '$lib/component/Datatable';
  import { FilterX } from 'lucide-svelte/icons';
  import { browser } from '$app/environment';
  import { Subscribe, Render } from 'svelte-headless-table';
  import { readable } from 'svelte/store';
  import type { PageData } from './$types';
  import { getUsersTable } from '$lib/table-users';

  let advanceFilter = true;
  export let data: PageData;
  const { headerRows, rows, tableAttrs, tableBodyAttrs, pluginStates } = getUsersTable(
    readable(data.listOfUsers)
  );
  const { filterValues } = pluginStates.filter;
  $: hasFilter = Object.values($filterValues).filter((v) => v !== undefined && v !== '').length;
</script>

{#if browser}
  <main class="container">
    <div class="grid mb-1">
      <div class="cell">
        <div class="cell">
          {#if advanceFilter}
            <form
              transition:slide={{ delay: 50, duration: 300, easing: quintInOut, axis: 'y' }}
              action=""
              class="block"
            >
              <FilterPanel />
            </form>
          {:else}
            <form
              transition:slide={{ delay: 50, duration: 300, easing: quintInOut, axis: 'y' }}
              action=""
              class="block"
            >
              <SearchUser />
            </form>
          {/if}
        </div>
      </div>
      <div class="cell"></div>
      <div class="cell">
        <Pagination on:advfilter={() => (advanceFilter = !advanceFilter)} />
      </div>
    </div>
    <table class="table is-hoverable is-fullwidth is-striped" {...$tableAttrs}>
      <thead class="block">
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
            <tr {...rowAttrs}>
              <td class="has-text-grey has-text-right has-text-weight-light">{idx + 1}</td>
              {#each row.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs>
                  <td {...attrs} class:has-text-danger={row.isData() && row.original.lock_password}>
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
