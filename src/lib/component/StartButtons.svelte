<script lang="ts">
  import type { OptCategory } from '$lib/types/schema';
  import { createEventDispatcher } from 'svelte';
  import RoundButton from '$lib/component/RoundButton.svelte';
  import ButtonsContainer from '$lib/component/ButtonsContainer.svelte';
  import { ChevronDown, ChevronLeft } from 'lucide-svelte/icons';
  import ChevronUp from 'lucide-svelte/icons/chevron-up';
  import { timeAction } from '$lib/data-store';
  import ButtonIcon from './ButtonIcon.svelte';

  export let disabled = false;
  let isDropdown = false;

  const dispatch = createEventDispatcher();
  const startTime = (entryType: OptCategory) => {
    isDropdown = false;
    dispatch('start', { entryType });
  };
</script>

<ButtonsContainer>
  <div class="field is-grouped is-grouped-left" slot="left">
    <ButtonIcon display="is-text" on:click={() => dispatch('left')}>
      <ChevronLeft />
    </ButtonIcon>
    <RoundButton {disabled} class="is-primary" name="Break" on:click={() => startTime('break')} />
    <RoundButton
      disabled={disabled || $timeAction.lunched}
      class="is-primary"
      name="Lunch"
      on:click={() => startTime('lunch')}
    />
  </div>
  <div class="field is-grouped is-grouped-centered" slot="right">
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
