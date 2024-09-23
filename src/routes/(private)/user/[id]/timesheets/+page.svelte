<script lang="ts">
	import type { PageData } from './$types';
	import type { OptCategory, TimeEntryRecord, TimesheetPostInfo } from '$lib/schema';
	import type { SubmitFunction } from '@sveltejs/kit';
	import ClockButtons from '$lib/component/ClockButtons.svelte';
	import ClockEndButtons from '$lib/component/ClockEndButtons.svelte';
	import TimesheetModal from '$lib/component/TimesheetModal.svelte';
	import { formatDateOrTime} from '$lib/utility';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { timesheet, timeAction, lunchRecord } from '$lib/data-store';
	import { enhance } from '$app/forms';

	onMount(async () => {
		importReady = true;
	});

	export let data: PageData;
	const FORM_ID = 'posttime'
	timesheet.set(data.userTimsheet?.timeEntries || []);
	if(data.userTimsheet){
		timeAction.set({
			confirm: false,
			state: 'end',
			nextState: 'start',
			category: 'break',
			date_at: '',
			isBreak: false,
			id: 0,
			timestamp: 0,
			lunched: $lunchRecord !== null,
			message: '',
		})
	}

	let importReady = false;
	let disabled = false;
	let timestamp = 0;
	let timeEntryForm: HTMLFormElement;

	const startTime = (event: CustomEvent<{ entryType: OptCategory }>) => {
		timeAction.start(event.detail.entryType);
	};

	const concludeBreak = () => {
		timeAction.end();
	};

	const handleEnhance: SubmitFunction = () => {
		timeAction.close();
		disabled = true;
		return async ({ result, update }) => {
			if (result.type === 'success') {
				const { record } = result.data || {};
				timesheet.updateSheet(record);
				timeAction.save(record.id);
				timestamp = $timeAction.nextState === 'end' ? record.start_at : 0;
				await update({ invalidateAll: false, reset: false });
			}
			disabled = false;
		};
	};
</script>

<main class="container">
	<TimesheetModal formId={FORM_ID} isActive={$timeAction.confirm} on:no={() => (disabled = false)} />
	<form class="is-hidden" id={FORM_ID} method="POST" bind:this={timeEntryForm} use:enhance={handleEnhance}>
		<input type="number" id="id" name="id" value={$timeAction.id} />
		<input type="text" id="category" name="category" value={$timeAction.category} />
		<input type="text" id="time-action" name="timeAction" value={$timeAction.state} />
		<input type="date" id="date-at" name="date_at" value={$timeAction.date_at} />;
	</form>
	<section class="mt-6">
		{#if !$timeAction.isBreak}
			<div in:fly={{ delay: 150, duration: 300, x: 0, y: -20, opacity: 0.5, easing: quintOut }}>
				<ClockButtons on:start={startTime} {disabled} />
			</div>
		{:else}
			<div in:fly={{ delay: 150, duration: 300, x: 0, y: -20, opacity: 0.5, easing: quintOut }}>
				<ClockEndButtons {timestamp} on:conclude={concludeBreak} category={$timeAction.category} />
			</div>
		{/if}
	</section>
	<section class="section">
		<table class="table is-fullwidth -is-striped is-hoverable">
			<thead>
				<tr>
					<th>Date</th>
					<th>Schedule ID</th>
					<th>Break Category</th>
					<th>Start At</th>
					<th>End At</th>
				</tr>
			</thead>
			<tbody>
				{#if $timesheet.length && importReady}
					{#each $timesheet as entry (entry.id)}
						<tr>
							<td>{entry.date_at}</td>
							<td>{entry.sched_id}</td>
							<td class="is-capitalized">{entry.category}</td>
							<td>{formatDateOrTime(new Date(entry.start_at * 1000), true, 8)}</td>
							<td
								>{entry.end_at ? formatDateOrTime(new Date(entry.end_at * 1000), true, 8) : '-'}</td
							>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</section>
</main>
