<script lang="ts">
	import type { OptCategory } from '$lib/schema';
	import { createEventDispatcher } from 'svelte';
	import RoundButton from '$lib/component/RoundButton.svelte';
	import ButtonsContainer from './ButtonsContainer.svelte';

	export let disabled = false;
	export let category = 'break';
	const dispatch = createEventDispatcher();
	const endTime = (entryType: OptCategory) => {
		dispatch('start', { entryType });
	};
</script>

<ButtonsContainer>
	<div class="field is-grouped is-justify-content-center" slot="left">
		<RoundButton {disabled} class="is-dark" name="Conclude" on:click={() => endTime('break')} />
	</div>
	<div class="field is-justify-content-center" slot="right">
		<h1 class="subtitle">{category}</h1>
	</div>
</ButtonsContainer>
