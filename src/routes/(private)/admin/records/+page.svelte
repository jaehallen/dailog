<script lang="ts">
  import type { PageData } from './$types';
  import ButtonIcon from '$lib/component/ButtonIcon.svelte';
  import { DateInput } from 'date-picker-svelte';
  import { UserRoundSearch } from 'lucide-svelte/icons';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { enhance } from '$app/forms';

  export let data: PageData;
  const regions = data.defaultOptions?.regions ?? [];
  let date = new Date();
  let now = new Date();
  const datePicker = {
    min: new Date(now.setDate(now.getDate() - 40)),
    max: new Date(),
    timePrecision: null,
    id: 'entrydate',
    format: 'yyyy-MM-dd',
    locale: {
      weekStartsOn: 0
    }
  };

  const onEntriesSearch: SubmitFunction = () => {
    return async ({update, result}) => {
      console.log(result)
    }
  }
</script>

<main class="container mt-6">
  <form action="?/search" class="block" method="POST" use:enhance={onEntriesSearch}>
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <div class="control">
            <ButtonIcon small round display="is-light is-link">
              <UserRoundSearch />
            </ButtonIcon>
          </div>
        </div>
        <div class="level-item">
          <div class="contro">
            <input type="hidden" value={date.toISOString().split("T")[0]} name="date_at" readonly />
            <input name="search" type="text" class="input is-small is-rounded" placeholder="Search User..." />
          </div>
        </div>
        <div class="level-item">
          <div class="select is-small is-rounded">
            <select name="region" id="region">
              {#if regions.length > 1}
                <option value="">All</option>
              {/if}
              {#each regions as region, id (id)}
                <option value={region}>{region}</option>
              {/each}
            </select>
          </div>
        </div>
        <div class="level-item">
          <div class="control">
            <DateInput bind:value={date} {...datePicker} />
          </div>
        </div>
      </div>
    </div>
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
    padding-inline-end: 2.5em
  }
</style>