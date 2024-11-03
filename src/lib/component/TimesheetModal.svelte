<script lang="ts">
  import Modal from './Modal.svelte';
  import { timeAction } from '$lib/data-store';
  import { createEventDispatcher } from 'svelte';
  import { Siren } from 'lucide-svelte/icons';

  export let isActive = false;
  export let formId = '';
  export let remarks = '';
  let dispatch = createEventDispatcher();
  const userYes = () => {
    dispatch('yes');
  };

  const userNo = () => {
    dispatch('no');
    isActive = false;
  };

  $: isClockOut = $timeAction.state == 'end' && $timeAction.category == 'clock';
</script>

<Modal {isActive}>
  <div slot="message">
    {#if isClockOut}
      <span class="icon-text has-text-danger">
        (<span class="icon">
          <Siren />
        </span>
        <span>Danger</span>)
      </span>
    {/if}
    {@html $timeAction.message}
    <div class="field">
      <div class="control">
        <textarea class="textarea" placeholder="Remarks (Optional)" rows="1" bind:value={remarks}
        ></textarea>
      </div>
    </div>
  </div>

  <button class="button card-footer-item is-ghost" on:click={userNo}>No</button>
  <button class="button card-footer-item is-ghost" form={formId} on:click={userYes}>
    {#if isClockOut}
      🥳 Clock Out
    {:else}
      Yes
    {/if}
  </button>
</Modal>
