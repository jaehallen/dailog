<script lang="ts">
	import type { OptCategory } from '$lib/schema';
	import { createEventDispatcher } from 'svelte';
	import RoundButton from '$lib/component/RoundButton.svelte';
	import ButtonsContainer from '$lib/component/ButtonsContainer.svelte';
	import LeftButton from '$lib/component/LeftButton.svelte';
	import { timeAction } from '$lib/data-store';

	export let disabled = false;

	const dispatch = createEventDispatcher();
	const startTime = (entryType: OptCategory) => {
		dispatch('start', { entryType });
	};
</script>

<ButtonsContainer>
	<div class="field is-grouped" slot="left">
		<LeftButton on:left />
		<RoundButton {disabled} class="is-primary" name="Break" on:click={() => startTime('break')} />
		<RoundButton
			disabled={disabled || $timeAction.lunched}
			class="is-primary"
			name="Lunch"
			on:click={() => startTime('lunch')}
		/>
	</div>
	<div class="field is-grouped is-justify-content-center" slot="right">
		<RoundButton {disabled} class="is-link is-light" name="Bio" on:click={() => startTime('bio')} />
		<RoundButton
			{disabled}
			class="is-link is-light"
			name="Coffee"
			on:click={() => startTime('coffee')}
		/>
		<RoundButton
			{disabled}
			class="is-link is-light"
			name="Clinic"
			on:click={() => startTime('clinic')}
		/>
	</div>
</ButtonsContainer>
