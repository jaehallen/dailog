<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { clockRecord } from '$lib/data-store';
	import type { OptActionState } from '$lib/schema';
	import RoundButton from '$lib/component/RoundButton.svelte';
	import ButtonsContainer from '$lib/component/ButtonsContainer.svelte';
	import LeftButton from '$lib/component/LeftButton.svelte';

	export let disabled = false;
	const dispatch = createEventDispatcher();
	const clock = (action: OptActionState) => {
		dispatch('timeclock', { action });
	};

	$: isClockIn = !$clockRecord || !$clockRecord.start_at;
</script>

<ButtonsContainer>
	<div class="field is-grouped" slot="left">
		<LeftButton on:left disabled={disabled || isClockIn} />
		<RoundButton
			disabled={disabled || !isClockIn}
			class="is-primary"
			name="Clock In"
			on:click={() => clock('start')}
		/>
	</div>
	<div class="field is-grouped is-justify-content-center" slot="right">
		<RoundButton
			disabled={disabled || !$clockRecord || !$clockRecord?.start_at}
			class="is-link is-danger"
			name="Clock Out"
			on:click={() => clock('end')}
		/>
	</div>
</ButtonsContainer>
