<script lang="ts">
  import type { PageData } from './$types';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { enhance } from '$app/forms';
  import SearchEntries from '$lib/component/SearchEntries.svelte';

  export let data: PageData;

  const onEntriesSearch: SubmitFunction = () => {
    return async ({ update, result }) => {
      console.log(result);
    };
  };
</script>

<main class="container mt-6">
  <form action="?/search" class="block" method="POST" use:enhance={onEntriesSearch}>
    <SearchEntries regions={data.defaultOptions?.regions} />
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

