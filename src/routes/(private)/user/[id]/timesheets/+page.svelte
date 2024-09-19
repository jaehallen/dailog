<script lang="ts">
	import RoundButton from '$lib/component/RoundButton.svelte';
	import { formatDateOrTime } from '$lib/utility';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const { timeEntries, startOfDuty, date_at } = data?.userTimsheet || {};
	let importReady = false;
	let formatDate = onMount(async () => {
		const { formatDateOrTime } = await import('$lib/utility');
		importReady = true;
	});
</script>

<main class="container">
	<section class="mt-6">
		<div class="columns is-centered">
			<div class="column is-half">
				<div class="columns box py-1">
					<div class="column">
						<div class="field is-grouped">
							<RoundButton class="is-primary" name="Break" />
							<RoundButton class="is-primary" name="Lunch" />
						</div>
					</div>
					<div class="column">
						<div class="field is-grouped">
							<RoundButton class="is-link is-light" name="Bio" />
							<RoundButton class="is-link is-light" name="Coffee" />
							<RoundButton class="is-link is-light" name="Clinic" />
						</div>
					</div>
				</div>
			</div>
		</div>
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
