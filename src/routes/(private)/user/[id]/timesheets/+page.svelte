<script lang="ts">
	import type { PageData } from './$types';
	import { formatDateOrTime } from '$lib/utility';
	import { onMount } from 'svelte';
	import ClockButtons from '$lib/component/ClockButtons.svelte';
	import ClockEndButtons from '$lib/component/ClockEndButtons.svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let data: PageData;

	const { timeEntries, startOfDuty, date_at } = data?.userTimsheet || {};
	let importReady = false;
	let disabled = false;
	let isBreak = false;
	let lunched = true;
	let formatDate = onMount(async () => {
		const { formatDateOrTime } = await import('$lib/utility');
		importReady = true;
	});

	const startTime = (event: CustomEvent<{ entryType: string }>) => {
		disabled = true;
		console.log(event.detail.entryType);
	};

</script>

<main class="container">
	<section class="mt-6">
		{#if !isBreak}
			<div in:fly={{ delay: 350, duration: 300, x: 100, y: -20, opacity: 0.5, easing: quintOut }}>
				<ClockButtons on:start={startTime} lunched={true} {disabled} />
			</div>
		{:else}
			<div in:fly={{ delay: 350, duration: 300, x: -100, y: -20, opacity: 0.5, easing: quintOut }}>
				<ClockEndButtons />
			</div>
		{/if}
	</section>
	<section class="section">
		<button
			class="button"
			on:click={() => {
				isBreak = !isBreak;
			}}>BUTTON</button
		>
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
				{#if timeEntries && importReady}
					{#each timeEntries as entry (entry.id)}
						<tr>
							<td>{entry.date_at}</td>
							<td>{entry.sched_id}</td>
							<td class="is-capitalized">{entry.category}</td>
							<td>{formatDateOrTime(new Date(entry.start_at * 1000), true, 8)}</td>
							<td>{entry.end_at || '-'}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</section>
</main>
