<script lang="ts">
  import type { PageData } from './$types';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { enhance } from '$app/forms';
  import SearchEntries from '$lib/component/SearchEntries.svelte';
  import { page } from '$app/stores';
  import { replaceState } from '$app/navigation';
  import {entriesQuery} from '$lib/table-entries'
  import { onMount } from 'svelte';

  export let data: PageData;
  export let date = new Date();

  const onEntriesSearch: SubmitFunction = () => {
    return async ({ update, result }) => {
      if (result.type === 'success') {
        console.log(result);
        if(result.data?.queries){
          $entriesQuery = result.data.queries;
          updateQuery(result.data.queries);
          date = new Date(result.data.queries.date_at)
        }
        update({ invalidateAll: false, reset: false });
      } else {
        console.error(result);
      }
    };
  };

  const getQuery = () => {
    const params = $page.url.searchParams;
    return {
      search: params.get('search') ?? '',
      date_at: params.get('date_at') ?? new Date().toISOString().substring(0, 10),
      region: params.get('region') ?? data?.user?.region ?? ''
    };
  };
  const updateQuery = async (values: { search: string; date_at: string; region: string }) => {
    Object.entries(values).forEach(([key, value]) => {
      $page.url.searchParams.set(key, String(value || ''));
    });
    replaceState($page.url, $page.state);
  };

  onMount(() => {
    if($page.url.searchParams.size){
      date = new Date($page.url.searchParams.get('date_at') ?? new Date().toISOString().substring(0, 10))
    }
  })
</script>

<main class="container mt-6">
  <input type="text" class="input" bind:value={$entriesQuery.date_at}>
  <form action="?/search" class="block" method="POST" use:enhance={onEntriesSearch}>
    <SearchEntries regions={data.defaultOptions?.regions} queries={$entriesQuery} {date}/>
  </form>
  <div class="box">
    <table class="is-striped is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th>test</th>
        </tr>
      </thead>
    </table>
  </div>
</main>

<style>
  :global([data-theme='dark'], .theme-dark) {
    --date-picker-background: #1b1e27;
    --date-picker-foreground: #f7f7f7;
  }

  :global(#entrydate) {
    font-size: var(--bulma-body-font-size);
    border-radius: var(--bulma-radius-rounded);
    padding-inline-start: 1em;
    padding-inline-end: 2.5em;
  }
</style>
