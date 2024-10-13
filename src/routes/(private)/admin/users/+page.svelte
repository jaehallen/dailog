<script lang="ts">
  import { browser } from '$app/environment';
  import type { PageData } from './$types';
  import { createTable, Subscribe, Render } from 'svelte-headless-table';
  import { readable } from 'svelte/store';

  export let data: PageData;
  const table = createTable(readable(data.listOfUsers));
  const columns = table.createColumns([
    table.column({ header: 'Active', accessor: 'active' }),
    table.column({ header: 'GAID', accessor: 'id' }),
    table.column({ header: 'Name', accessor: 'name' }),
    table.column({ header: 'Region', accessor: 'region' }),
    table.column({ header: 'Role', accessor: 'role' }),
    table.column({ header: 'Lead', accessor: 'lead_id' }),
    table.column({ header: 'Team Lead', accessor: 'teamlead' }),
    table.column({ header: 'Lock Password', accessor: 'lock_password' }),
    table.column({ header: 'Latest Schedule', accessor: 'latest_schedule' }),
    table.column({ header: 'Total Schedule', accessor: 'total_schedule' })
  ]);
  const { headerRows, rows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);
</script>

{#if browser}
  <main class="container">
    <table class="table is-hoverable is-fullwidth is-striped" {...$tableAttrs}>
      <thead>
        {#each $headerRows as headerRow (headerRow.id)}
          <Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
            <tr {...rowAttrs}>
              {#each headerRow.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs>
                  <th {...attrs}>
                    <Render of={cell.render()} />
                  </th>
                </Subscribe>
              {/each}
            </tr>
          </Subscribe>
        {/each}
      </thead>
      <tbody {...$tableBodyAttrs}>
        {#each $rows as row (row.id)}
          <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
            <tr {...rowAttrs}>
              {#each row.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs>
                  <td {...attrs}>
                    <Render of={cell.render()} />
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
