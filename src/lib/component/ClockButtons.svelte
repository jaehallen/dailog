<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { timeLog } from '$lib/data-store';
  import type { OptActionState } from '$lib/types/schema';
  import RoundButton from '$lib/component/RoundButton.svelte';
  import ButtonsContainer from '$lib/component/ButtonsContainer.svelte';
  import LeftButton from '$lib/component/LeftButton.svelte';

  export let disabled = false;
  const dispatch = createEventDispatcher();
  const clock = (action: OptActionState) => {
    dispatch('timeclock', { action });
  };

  $: isClockIn = !$timeLog.clocked || !$timeLog.clocked.start_at;
</script>

<ButtonsContainer>
  <div class="field is-grouped" slot="left">
    <LeftButton on:left disabled={disabled || isClockIn} />
  </div>
  <div class="field is-grouped is-justify-content-center" slot="right">
    {#if isClockIn}
      <RoundButton
        disabled={disabled || !isClockIn}
        class="is-primary"
        name="Clock In"
        on:click={() => clock('start')}
      />
    {:else}
      <RoundButton
        disabled={disabled || !$timeLog || !$timeLog.clocked?.start_at}
        class="is-link is-danger"
        name="Clock Out"
        on:click={() => clock('end')}
      />
    {/if}
  </div>
</ButtonsContainer>
