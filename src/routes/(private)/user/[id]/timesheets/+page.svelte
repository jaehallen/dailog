<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import type { OptCategory, TimeEntryRecord, TimesheetPostInfo } from '$lib/schema';
	import type { SubmitFunction } from '@sveltejs/kit';
	import ClockButtons from '$lib/component/ClockButtons.svelte';
	import ClockEndButtons from '$lib/component/ClockEndButtons.svelte';
	import TimesheetModal from '$lib/component/TimesheetModal.svelte';
	import { CONFIRMCATEGORY } from '$lib/schema';
	import { applyAction, enhance } from '$app/forms';
	import { formatDateOrTime, updateEntries } from '$lib/utility';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { timesheet } from '$lib/data-store';

	onMount(async () => {
		const { formatDateOrTime, updateEntries } = await import('$lib/utility');
		importReady = true;
	});

	export let data: PageData;
	let { startOfDuty = false, date_at } = data?.userTimsheet ?? {};
	let formData: TimesheetPostInfo;
	let timeEntries: TimeEntryRecord[];
	$: formData = { id: 0, category: 'break', timeAction: 'start', date_at: date_at || '' };
	timesheet.set(data.userTimsheet?.timeEntries || []);

	let dialog: HTMLDialogElement;
	let importReady = false;
	let disabled = false;
	let isBreak = false;
	let lunched = false;
	let timestamp = 0;
	let timeEntryForm: HTMLFormElement;
	let modalInfo = {
		message: '',
		isActive: false,
		formId: 'posttime'
	};

	const confirmAction = () => {
		modalInfo.message = CONFIRMCATEGORY[formData.category][formData.timeAction];
		modalInfo.isActive = true;
	};
	const startTime = (event: CustomEvent<{ entryType: OptCategory }>) => {
		disabled = true;
		formData = { date_at: date_at, timeAction: 'start', category: event.detail.entryType, id: 0 };
		confirmAction();
	};

	const concludeBreak = () => {
		disabled = true;
		formData.timeAction = 'end';
		console.log(formData);
		confirmAction();
		// const lastRecord = timeEntries?.reduce((latest: TimeEntryRecord, entry: TimeEntryRecord) => {
		// 	if (entry.start_at > latest.start_at) {
		// 		latest = { ...entry };
		// 	}
		// 	return latest;
		// });
		//
		// if (lastRecord && !lastRecord.end_at) {
		// 	formData = {
		// 		timeAction: 'end',
		// 		category: lastRecord.category,
		// 		id: lastRecord.id
		// 	};
		// 	confirmAction();
		// }
	};

	const handleEnhance: SubmitFunction = ({ formData: data }) => {
		modalInfo.isActive = false;
		console.log(data);
		return async ({ result, update }) => {
			if (result.type === 'success') {
				const { record, timeAction } = result.data || {};

				if (formData.timeAction === 'start') {
					isBreak = true;
					timestamp = record.start_at;
					formData.id = record.id;
				} else {
					isBreak = false;
					timestamp = 0;
					lunched = formData.category === 'lunch';
				}
				timesheet.updateSheet(record);
				await update({ invalidateAll: false, reset: false });
			}
			disabled = false;
		};
	};

	function hasLunchedToday() {
		const lunchEntry = timeEntries?.find((entry) => {
			return entry.category == 'lunch' && entry.date_at == date_at;
		});

		return Boolean(lunchEntry?.id);
	}
</script>

<main class="container">
	<TimesheetModal {...modalInfo} on:no={() => (disabled = false)} />
	<form id="posttime" method="POST" bind:this={timeEntryForm} use:enhance={handleEnhance}>
		<input type="number" id="id" name="id" value={formData.id} />
		<input type="text" id="category" name="category" value={formData.category} />
		<input type="text" id="time-action" name="timeAction" value={formData.timeAction} />
		<input type="date" id="date-at" name="date_at" value={date_at} />;
	</form>
	<section class="mt-6">
		{#if !isBreak}
			<div in:fly={{ delay: 150, duration: 300, x: 0, y: -20, opacity: 0.5, easing: quintOut }}>
				<ClockButtons on:start={startTime} {lunched} {disabled} />
			</div>
		{:else}
			<div in:fly={{ delay: 150, duration: 300, x: 0, y: -20, opacity: 0.5, easing: quintOut }}>
				<ClockEndButtons {timestamp} on:conclude={concludeBreak} category={formData.category} />
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
				{#if $timesheet && importReady}
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
