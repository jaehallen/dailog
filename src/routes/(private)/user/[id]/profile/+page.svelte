<script lang="ts">
	import Modal from '$lib/component/Modal.svelte';
	import Field from '$lib/component/Field.svelte';
	import { scheduleColumn } from '$lib/table-schema';
	import type { PageData } from './$types';

	export let data: PageData;
	let isActive = false;
</script>

<main class="container is-fullhd">
	<Modal {isActive}>
		<form action="" slot="message">
			<Field label="Old Password">
				<input type="password" class="input" placeholder="Old Password" />
			</Field>
			<Field label="New Password">
				<input type="password" class="input" placeholder="New Password" />
			</Field>
			<Field>
				<input type="password" class="input" placeholder="Confirm New Password" />
			</Field>
		</form>
		<button class="button card-footer-item is-ghost" on:click={() => (isActive = false)}
			>Cancel</button
		>
		<button class="button card-footer-item is-ghost">Save</button>
	</Modal>
	{#await data.user}
		<h1>data ...</h1>
	{:then user}
		<section class="section">
			<div class="fixed-grid has-2-cols">
				<div class="grid">
					<div class="cell">
						<h2 class="title is-4">{user?.name || 'No User'}</h2>
						<p class="subtitle is-6">
							{user?.id || 'No ID'}
							{#if !user?.lock_password}
								<br />
								<button class="button is-ghost p-0 m-0" on:click={() => (isActive = true)}
									>Reset Password</button
								>
							{/if}
						</p>
					</div>
					<div class="cell">
						<div class="level">
							<div class="level-item">
								<p class="heading">Team Lead:&emsp;</p>
								<p class="title is-5">
									{user?.teamlead}
								</p>
							</div>
							<div class="level-item">
								<p class="heading">Region:&emsp;</p>
								<p class="title is-5">
									{user?.region}
								</p>
							</div>
						</div>
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
							<th class="has-text-right"> {column.title} </th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#if data.schedules.length}
						{#each data.schedules as sched (sched.id)}
							<tr>
								{#each scheduleColumn as column, cid (cid)}
									<td class="has-text-right"> {@html column.render(sched[column.key] || '-')} </td>
								{/each}
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</section>
	{/await}
</main>
