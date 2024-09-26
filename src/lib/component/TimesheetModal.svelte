<script lang="ts">
	import { timeAction } from '$lib/data-store';
	import Modal from './Modal.svelte';
	import { createEventDispatcher } from 'svelte';
	export let isActive = false;
	export let formId = '';
	let dispatch = createEventDispatcher();
	const userYes = () => {
		dispatch('yes');
	};

	const userNo = () => {
		dispatch('no');
		isActive = false;
	};
</script>

<Modal {isActive}>
	<p slot="message">{@html $timeAction.message}</p>
	<button class="button card-footer-item is-ghost" on:click={userNo}>No</button>
	<button class="button card-footer-item is-ghost" form={formId} on:click={userYes}>Yes</button>
</Modal>
