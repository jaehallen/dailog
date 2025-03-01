<script lang="ts">
  import type { PageData } from './$types';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { timeReports, recordInfo } from '$lib/reports-data';
  import { reportColumn } from '$lib/table-schema';
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import { DateInput } from 'date-picker-svelte';
  import CalendarSearch from 'lucide-svelte/icons/calendar-search';
  import { flip } from 'svelte/animate';

  export let data: PageData;
  let date = new Date();
  let now = new Date();
  let disabled = false;
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

  onMount(() => {
    if (data.error) {
      console.error(data.error);
    } else {
      timeReports.updateReports(data?.userTimesheet ?? []);
    }
  });

  $: dateEntry = date.toISOString().substring(0, 10);

  const handSubmit: SubmitFunction = async ({ cancel, formData }) => {
    disabled = true;
    const date = formData.get('date');
    const unix = new Date(date as string).getTime();

    if (unix >= $recordInfo.startOfWeek && unix <= $recordInfo.endOfWeek) {
      cancel();
      disabled = false;
    }

    return async ({ result, update }) => {
      if (result.type === 'success') {
        if (result.data?.userTimesheet) {
          timeReports.updateReports(result.data.userTimesheet);
        }
      } else {
        console.error(result);
      }
      disabled = false;
      await update({ invalidateAll: false, reset: false });
    };
  };
</script>

<main class="container">
  <section class="section">
    <form method="post" use:enhance={handSubmit}>
      <input type="hidden" value={dateEntry} name="date" readonly />
      <div class="field is-grouped is-align-items-center">
        <div class="control">
          <DateInput bind:value={date} {...datePicker} />
        </div>
        <div class="control">
          <button class="button is-text" {disabled}
            ><span class="icon"><CalendarSearch /></span></button
          >
        </div>
      </div>
    </form>
    <table class="table is-fullwidth is-hoverable" class:is-skeleton={disabled}>
      <thead>
        <tr>
          {#each reportColumn as column, cid (cid)}
            <th> {column.title} </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if $timeReports.length}
          {#each $timeReports as entry (entry.id)}
            <tr class:is-dark={entry.category === 'clock'} animate:flip>
              {#each reportColumn as column, cid (cid)}
                <td class:is-light={entry.category !== 'clock' && column.key == 'date_at'}>
                  {@html column.render(entry[column.key] || '-', entry)}
                </td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
    {#if disabled}
      <div class="skeleton-lines">
        {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as temp (temp)}
          <div></div>
        {/each}
      </div>
    {/if}
  </section>
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
