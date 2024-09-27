<script lang="ts">
	import Modal from '$lib/component/Modal.svelte';
	import Field from '$lib/component/Field.svelte';
	import Notify from '$lib/component/Notify.svelte';
	import { scheduleColumn } from '$lib/table-schema';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { SvelteComponent } from 'svelte';

	const RESET_FORM_ID = 'resetform';
	export let data: PageData;
	export let notify: SvelteComponent<{
		notify?: ((msg: string, isDanger?: boolean) => void) | undefined;
	}>;
	let isActive = false;
	let disabled = false;
	let newPassword = '';
	let retypePassword = '';
	let invalidPassword = false;

	const handleEnhance: SubmitFunction = ({ cancel }) => {
		if (data.user?.lock_password) {
			confirm(
				'This account password is locked, please contact your team lead to reset your password.'
			);
			cancel();
			isActive = false;
			return;
		}
		disabled = true;
		return async ({ update, result }) => {
			if (result.type === 'success') {
				update();
				isActive = false;
				notify.notify('Password Reset Successful')
			} else if (result.type === 'failure') {
				invalidPassword = result.data?.incorrect;
				update({ reset: false });
			}
			disabled = false;
		};
	};
</script>

<main class="container is-fullhd">
	<Notify bind:this={notify} />
	<Modal {isActive}>
		<form slot="message" method="post" id={RESET_FORM_ID} use:enhance={handleEnhance}>
			<Field label="Old Password" name="old">
				<input
					type="password"
					name="old"
					id="old"
					class="input"
					placeholder="Old Password"
					required
					minlength="6"
					on:focus={() => (invalidPassword = false)}
				/>
				<div class:is-hidden={!invalidPassword} class="help is-danger">Invalid Password</div>
			</Field>
			<Field label="New Password" name="new">
				<input
					type="password"
					name="new"
					id="new"
					class="input"
					placeholder="New Password"
					bind:value={newPassword}
					required
					minlength="6"
				/>
			</Field>
			<Field>
				<input
					type="password"
					class="input"
					placeholder="Confirm New Password"
					bind:value={retypePassword}
					required
					minlength="6"
				/>
			</Field>
		</form>
		<button {disabled} class="button card-footer-item is-ghost" on:click={() => (isActive = false)}
			>Cancel</button
		>
		<button
			form={RESET_FORM_ID}
			class:is-loading={disabled}
			disabled={retypePassword !== newPassword}
			class="button card-footer-item is-ghost">Save</button
		>
	</Modal>
	{#await data.user}
		<section class="skeleton-block"></section>
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
