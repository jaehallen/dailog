<script lang="ts">
	import type { PageData } from './$types';
	import type { OptActionState, OptCategory, TimeEntryRecord } from '$lib/schema';
	import type { SubmitFunction } from '@sveltejs/kit';
	import StartButtons from '$lib/component/StartButtons.svelte';
	import EndButtons from '$lib/component/EndButtons.svelte';
	import TimesheetModal from '$lib/component/TimesheetModal.svelte';
	import ClockButtons from '$lib/component/ClockButtons.svelte';
	import { timeDuration } from '$lib/utility';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { timesheet, timeAction, timeLog } from '$lib/data-store';
	import { enhance } from '$app/forms';
	import { timesheetColumn } from '$lib/table-schema';

	export let data: PageData;
	const FORM_ID = 'posttime';

	let importReady = false;
	let disabled = true;
	let timestamp = 0;
	let clockInOut = false;

	onMount(async () => {
		if (data.userTimsheet) {
			const { timeEntries, date_at } = data.userTimsheet;
			timesheet.set(
				timeEntries
					.filter((entry: TimeEntryRecord) => entry.date_at === date_at)
					.sort((a, b) => b.start_at - a.start_at)
			);
			timeAction.validate($timeLog.lastBreak, $timeLog.lunch, date_at);
		}

		timestamp = $timeAction.timestamp;
		importReady = true;
		clockInOut = !$timeLog.clocked;
		disabled = false;
	});

	const startTime = (event: CustomEvent<{ entryType: OptCategory }>) => {
		timeAction.start(event.detail.entryType);
	};

	const concludeBreak = () => {
		timeAction.end();
	};

	const timeclock = (event: CustomEvent<{ action: OptActionState }>) => {
		if (event.detail.action == 'start') {
			timeAction.clockIn();
		} else if ($timeLog.clocked) {
			timeAction.clockOut($timeLog.clocked.id);
		}
	};

	const handleEnhance: SubmitFunction = () => {
		timeAction.close();
		disabled = true;
		return async ({ result, update }) => {
			if (result.type === 'success') {
				const { record } = result.data || {};
				if (record) {
					timesheet.updateSheet(record);
					if (record.category == 'clock' && !record.end_at) {
						leftToggle();
					}
					if (record.category !== 'clock') {
						timestamp = $timeAction.nextState === 'end' ? record.start_at : 0;
						timeAction.save(record.id);
					}
				}
			} else {
				console.log(result);
			}
			await update({ invalidateAll: false, reset: false });
			disabled = false;
		};
	};

	const leftToggle = () => {
		clockInOut = !$timeLog.clocked || !clockInOut;
	};
</script>

<main class="container">
	<TimesheetModal
		formId={FORM_ID}
		isActive={$timeAction.confirm}
		on:no={() => (disabled = false)}
	/>
	<form class="is-hidden" id={FORM_ID} method="POST" use:enhance={handleEnhance}>
		<input type="number" id="id" name="id" value={$timeAction.id} />
		<input type="text" id="category" name="category" value={$timeAction.category} />
		<input type="text" id="time-action" name="timeAction" value={$timeAction.state} />
		<input type="date" id="date-at" name="date_at" value={$timeAction.date_at} />;
	</form>
	<section class="mt-6">
		{#if $timeLog.clocked && !clockInOut && !$timeLog.endOfDay}
			<div in:fly={{ delay: 200, duration: 300, x: 100, y: 0, opacity: 0.5, easing: quintOut }}>
				{#if !$timeAction.isBreak}
					<div in:fly={{ delay: 150, duration: 300, x: 0, y: -20, opacity: 0.5, easing: quintOut }}>
						<StartButtons on:start={startTime} on:left={leftToggle} {disabled} />
					</div>
				{:else}
					<div in:fly={{ delay: 150, duration: 300, x: 0, y: -20, opacity: 0.5, easing: quintOut }}>
						<EndButtons
							{timestamp}
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
				<ClockButtons on:left={leftToggle} on:timeclock={timeclock} />
			</div>
		{/if}
	</section>
	<section class="section">
		<table class="table is-fullwidth -is-striped is-hoverable">
			<thead>
				<tr>
					{#each timesheetColumn as column, cid (cid)}
						<th> {column.title} </th>
					{/each}
					<th>Duration</th>
				</tr>
			</thead>
			<tbody>
				{#if $timesheet.length && importReady}
					{#each $timesheet as entry (entry.id)}
						<tr>
							{#each timesheetColumn as column, cid (cid)}
								<td> {@html column.render(entry[column.key] || '-')} </td>
							{/each}
							<td>{timeDuration(entry.start_at, entry.end_at)}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</section>
</main>
