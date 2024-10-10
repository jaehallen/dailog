<script lang="ts">
  import type { OptCategory } from '$lib/schema';
  import { createEventDispatcher } from 'svelte';
  import RoundButton from '$lib/component/RoundButton.svelte';
  import ButtonsContainer from '$lib/component/ButtonsContainer.svelte';
  import Timer from '$lib/component/Timer.svelte';

  export let timestamp = 0;
  export let disabled = false;
  export let category: OptCategory = 'break';
  const dispatch = createEventDispatcher();
  const endTime = (entryType: OptCategory) => {
    dispatch('conclude', { entryType });
  };
</script>

<ButtonsContainer>
  <div class="field is-grouped is-justify-content-center" slot="left">
    <RoundButton
      class={disabled ? 'is-dark is-loading' : 'is-dark'}
      name="Conclude"
      on:click={() => endTime(category)}
    />
  </div>
  <div class="field is-justify-content-center" slot="right">
    <h1 class="subtitle is-capitalized">{category}: <Timer {timestamp} /></h1>
  </div>
</ButtonsContainer>
