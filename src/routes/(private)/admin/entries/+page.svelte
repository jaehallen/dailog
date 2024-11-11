<script lang="ts">
  import type { PageData } from './$types';
  import type { SubmitFunction } from '@sveltejs/kit';
  import type { UserTimesheetReport } from '$lib/types/schema';
  import SearchEntries from '$lib/component/SearchEntries.svelte';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { replaceState } from '$app/navigation';
  import { entriesData, getEntriesTable } from '$lib/table-entries';
  import { onMount } from 'svelte';
  import { Subscribe, Render } from 'svelte-headless-table';
  import { fly } from 'svelte/transition';
  import Toasts from '$lib/component/Toasts.svelte';
  import { toasts } from '$lib/data-store';
  import { sineIn } from 'svelte/easing';
  import { isAdmin } from '$lib/utility';

  export let data: PageData;

  let searchForm: HTMLFormElement;
  let loading = true;
  let qEntries = data?.entriesQuery ?? {
    search: '',
    date_at: new Date().toISOString().substring(0, 10),
    region: data?.user?.region ?? ''
  };
  let date = qEntries?.date_at ? new Date(qEntries?.date_at) : new Date();
  const { headerRows, rows, tableAttrs, tableBodyAttrs } = getEntriesTable(entriesData ?? []);

  const onEntriesSearch: SubmitFunction = ({ formData, cancel }) => {
    loading = true;
    if (String(formData.get('search') ?? '').length < 3) {
      loading = false;
      toasts.add({ message: 'Invalid Name', type: 'info' });
      cancel();
    }
    formData.set('date_at', date.toISOString().substring(0, 10));
    return async ({ update, result }) => {
      if (result.type === 'success') {
        if (result.data?.queries) {
          updateQuery(result.data.queries);
          date = new Date(result.data.queries.date_at);
          entriesData.updateList(result.data.entriesResults);
        }
        update({ invalidateAll: false, reset: false });
      } else {
        console.error(result);
        let message = result.type == 'error' ? result.error.message : 'Something went wrong';
        if (!result.type) {
          message = 'Internal Server Error';
        }
        toasts.add({ message, type: 'error', timeout: 0 });
      }
      loading = false;
    };
  };

  const updateQuery = async (values: { search: string; date_at: string; region: string }) => {
    Object.entries(values).forEach(([key, value]) => {
      $page.url.searchParams.set(key, String(value || ''));
    });
    replaceState($page.url, $page.state);
  };

  onMount(() => {
    if (data.entriesResults) {
      entriesData.updateList(data.entriesResults);
    }
    loading = false;
  });

  const rowStyle = (data: UserTimesheetReport, column: string | undefined) => {
    const { category } = data;
    if (category == 'clock' && !column) {
      return 'has-text-weight-bold is-dark';
    } else if (column && category !== 'clock') {
      if (['user_id', 'name', 'clock_at'].includes(column)) {
        return '';
      }
    }
    return '';
  };

  const onSearchEntry = () => {
    searchForm.requestSubmit();
  };
</script>

<Toasts />
<main class="container mt-6">
  <form
    action="?/search"
    class="block"
    method="POST"
    use:enhance={onEntriesSearch}
    bind:this={searchForm}
  >
    <SearchEntries
      regions={data.defaultOptions?.regions?.filter(
        (r) => isAdmin(data.user?.role) || r == data.user?.region
      )}
      queries={qEntries}
      bind:date
      on:search={onSearchEntry}
      disabled={loading}
    />
  </form>
  <div class="box">
    <table
      class="table is-striped is-hoverable is-fullwidth"
      class:is-skeleton={loading}
      {...$tableAttrs}
    >
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
        {#if !$rows.length}
          <tr>
            <td colspan="0">
              <strong>No ENTRIES</strong>
            </td>
          </tr>
        {:else}
          {#each $rows as row (row.id)}
            {#if row.isData()}
              <Subscribe rowAttrs={row.attrs()} rowProps={row.props()} let:rowAttrs>
                {#key row.original.id}
                  <tr
                    {...rowAttrs}
                    in:fly={{ delay: 200, duration: 300, x: '-20rem', easing: sineIn }}
                    class={rowStyle(row.original, undefined)}
                  >
                    {#each row.cells as cell (cell.id)}
                      {#if cell.isData()}
                        <Subscribe attrs={cell.attrs()} let:attrs>
                          <td {...attrs} class={rowStyle(row.original, cell.column.id)}>
                            {#if cell.value == null || cell.value == undefined}
                              <Render of={'-'} />
                            {:else}
                              <Render of={cell.render()} />
                            {/if}
                          </td>
                        </Subscribe>
                      {/if}
                    {/each}
                  </tr>
                {/key}
              </Subscribe>
            {/if}
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</main>

<style>
  :global([data-theme='dark'], .theme-dark) {
    --date-picker-background: #1b1e27;
    --date-picker-foreground: #f7f7f7;
  }

  :global(.date-time-picker) {
    width: 16rem;
  }
  :global(#entrydate) {
    font-size: var(--bulma-body-font-size);
    border-radius: var(--bulma-radius-rounded);
    padding-inline-start: 1em;
    padding-inline-end: 2.5em;
    width: 10em;
  }
</style>
