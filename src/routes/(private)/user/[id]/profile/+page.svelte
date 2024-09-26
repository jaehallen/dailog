<script lang="ts">
	import { scheduleColumn } from '$lib/table-schema';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<main class="container is-fullhd">
	{#await data}
		<h1>data ...</h1>
	{:then data}
		<section class="section">
			<div class="fixed-grid has-2-cols">
				<div class="grid">
					<div class="cell">
						<h2 class="title is-4">{data.user?.name || 'No User'}</h2>
						<p class="subtitle is-6">
							{data.user?.id || 'No ID'}
							{#if !data.user?.lock_password}
								<br />
								<button class="button is-ghost p-0 m-0">Reset Password</button>
							{/if}
						</p>
					</div>
					<div class="cell">
						<h3 class="subtitle mb-1">
							<strong>Teamlead: </strong><span>{data?.user?.teamlead || 'No TeamLead'}</span>
						</h3>
						<h3 class="subtitle mb-1 is-align-items-center">
							<strong>Region: </strong><span>{data?.user?.region || 'No Region'}</span>
						</h3>
					</div>
					<div class="cell"></div>
				</div>
			</div>
		</section>
		<section>
			<table class="table is-fullwidth -is-striped is-hoverable">
				<thead>
					<tr>
						{#each scheduleColumn as column, cid (cid)}
							<th> {column.title} </th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#if data.schedules.length}
						{#each data.schedules as sched (sched.id)}
							<tr>
								{#each scheduleColumn as column, cid (cid)}
									<td> {@html column.render(sched[column.key] || '-')} </td>
								{/each}
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</section>
	{/await}
</main>
