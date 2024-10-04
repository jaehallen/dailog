<script lang="ts">
	import type { OptCategory } from '$lib/schema';
	import { createEventDispatcher } from 'svelte';
	import RoundButton from '$lib/component/RoundButton.svelte';
	import ButtonsContainer from '$lib/component/ButtonsContainer.svelte';
	import LeftButton from '$lib/component/LeftButton.svelte';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import ChevronUp from 'lucide-svelte/icons/chevron-up';
	import { timeAction } from '$lib/data-store';

	export let disabled = false;
	let isDropdown = false;

	const dispatch = createEventDispatcher();
	const startTime = (entryType: OptCategory) => {
		isDropdown = false;
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

		<div class="dropdown" class:is-active={isDropdown}>
			<div class="dropdown-trigger">
				<button
					class="button is-link is-light is-rounded"
					on:click={() => (isDropdown = !isDropdown)}
					{disabled}
				>
					<span>Other</span>
					<span class="icon is-small">
						{#if isDropdown}
							<ChevronUp />
						{:else}
							<ChevronDown />
						{/if}
					</span>
				</button>
			</div>
			<div class="dropdown-menu" id="dropdown-menu4" role="menu">
				<div class="dropdown-content">
					<div class="dropdown-item">
						<button class="dropdown-item" on:click={() => startTime('coffee')}>Coffee</button>
						<button class="dropdown-item" on:click={() => startTime('coaching')}>Coaching</button>
						<button class="dropdown-item" on:click={() => startTime('meeting')}>Meeting</button>
						<button class="dropdown-item" on:click={() => startTime('clinic')}>Clinic</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</ButtonsContainer>
