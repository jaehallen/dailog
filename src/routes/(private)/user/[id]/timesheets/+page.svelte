<script lang="ts">
  import type { SubmitFunction } from '@sveltejs/kit';
  import type { PageData } from './$types';
  import type { OptActionState, OptCategory, TimeEntryRecord } from '$lib/types/schema';
  import StartButtons from '$lib/component/StartButtons.svelte';
  import EndButtons from '$lib/component/EndButtons.svelte';
  import TimesheetModal from '$lib/component/TimesheetModal.svelte';
  import ClockButtons from '$lib/component/ClockButtons.svelte';
  import { isEqual } from '$lib/utility';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { timesheet, timeAction, timeLog } from '$lib/data-store';
  import { enhance } from '$app/forms';
  import { timesheetColumn } from '$lib/table-schema';
  import { browser } from '$app/environment';
  import { STORAGENAME } from '$lib/defaults';

  export let data: PageData;
  const FORM_ID = 'posttime';

  let importReady = false;
  let disabled = true;
  let clockInOut = false;
  let remarks = '';

  onMount(() => {
    if (data.userTimsheet) {
      const { timeEntries, schedule } = data.userTimsheet;
      timesheet.set(
        timeEntries
          .filter((entry: TimeEntryRecord) => entry.date_at === schedule.date_at)
          .sort((a, b) => a.start_at - b.start_at)
      );
      timeAction.validate($timeLog, schedule);
    }

    clockInOut = !$timeLog.clocked;
    disabled = false;
    importReady = true;

    window.addEventListener('storage', (e) => {
      if (e.newValue == null || e.newValue == undefined) return;
      const val = JSON.parse(e.newValue);
      if (e.key == STORAGENAME.timesheet) {
        if (!isEqual(val, $timesheet)) {
          timesheet.set(val);
        }
      } else if (e.key == STORAGENAME.action) {
        if (!isEqual(val, $timeAction)) {
          timeAction.set(val);
        }
      }
    });

    return () => {
      window.removeEventListener('storage', () => {});
    };
  });

  const startTime = (event: CustomEvent<{ entryType: OptCategory }>) => {
    disabled = true;
    timeAction.start(event.detail.entryType);
  };

  const concludeBreak = () => {
    disabled = true;
    timeAction.end();
  };

  const timeclock = (event: CustomEvent<{ action: OptActionState }>) => {
    disabled = true;
    if (event.detail.action == 'start') {
      timeAction.clockIn();
    } else if ($timeLog.clocked) {
      timeAction.clockOut($timeLog.clocked.id);
    }
  };

  const handleEnhance: SubmitFunction = () => {
    timeAction.cancel();
    return async ({ result, update }) => {
      if (result.type === 'success') {
        const { record } = result.data || {};
        if (record) {
          timesheet.updateSheet(record);
          if (record.category == 'clock' && !record.end_at) {
            leftToggle();
          }
          if (record.category !== 'clock') {
            timeAction.save(record);
          }
        }
      } else {
        console.error(result);
      }
      await update({ invalidateAll: false, reset: false });
      disabled = false;
      remarks = '';
    };
  };

  const leftToggle = () => {
    clockInOut = !$timeLog.clocked || !clockInOut;
  };

  const cancel = () => {
    disabled = false;
    remarks = '';
    timeAction.cancel();
  };

  let clientWidth = 300;
</script>

{#if browser}
  <main class="container">
    <TimesheetModal formId={FORM_ID} isActive={$timeAction.confirm} on:no={cancel} bind:remarks />
    <form class="is-hidden" id={FORM_ID} method="POST" use:enhance={handleEnhance}>
      <input type="number" id="id" name="id" value={$timeAction.id} readonly />
      <input type="text" id="category" name="category" value={$timeAction.category} readonly />
      <input type="text" id="time-action" name="timeAction" value={$timeAction.state} readonly />
      <input type="date" id="date-at" name="date_at" value={$timeAction.date_at} readonly />;
      <input type="number" id="sched-id" name="sched_id" value={$timeAction.sched_id} readonly />
      <input type="textarea" id="remarks" name="remarks" value={remarks} />
    </form>
    <section class="mt-6">
      {#if $timeLog.clocked && !clockInOut && !$timeLog.endOfDay}
        <div in:fly={{ delay: 200, duration: 300, x: 100, y: 0, opacity: 0.5, easing: quintOut }}>
          {#if !$timeAction.isBreak}
            <div in:fly={{ delay: 150, duration: 300, y: '-2rem', opacity: 0.5, easing: quintOut }}>
              <StartButtons on:start={startTime} on:left={leftToggle} {disabled} />
            </div>
          {:else}
            <div in:fly={{ delay: 150, duration: 300, y: '-2rem', opacity: 0.5, easing: quintOut }}>
              <EndButtons
                timestamp={$timeAction.timestamp}
                on:conclude={concludeBreak}
                category={$timeAction.category}
                {disabled}
              />
            </div>
          {/if}
        </div>
      {/if}
      {#if clockInOut && !$timeLog.endOfDay}
        <div in:fly={{ delay: 200, duration: 300, x: 100, y: 0, opacity: 0.5, easing: quintOut }}>
          <ClockButtons on:left={leftToggle} on:timeclock={timeclock} {disabled} />
        </div>
      {/if}
    </section>
    <section class="section">
      <table class="table is-fullwidth is-striped is-hoverable" bind:clientWidth>
        <thead>
          <tr>
            {#each timesheetColumn as column, cid (cid)}
              <th> {column.title} </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#if $timesheet.length && importReady}
            {#each $timesheet as entry (entry.id)}
              <tr class:is-dark={entry.category === 'clock'}>
                {#each timesheetColumn as column, cid (cid)}
                  <td class:is-light={entry.category !== 'clock' && column.key == 'date_at'}>
                    {@html column.render(entry[column.key] || '-', {
                      local_offset: $timeAction.local_offset,
                      clientWidth: clientWidth
                    })}
                  </td>
                {/each}
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </section>
  </main>
{/if}

<style>
  :global(.remarks) {
    white-space: pre-wrap;
  }
</style>
