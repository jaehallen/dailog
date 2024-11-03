<script lang="ts">
  import { createEventDispatcher} from 'svelte';
  import { fade } from 'svelte/transition';

  export let type: 'success' | 'error' | 'info' = 'success';
  const dispatch = createEventDispatcher();
</script>

<article class={`toast notification py-4 mb-2 is-light is-${type == 'error' ? 'danger' : type}`} role="alert" transition:fade>
  <button class="delete" on:click={() => dispatch('dismiss')}></button>
  <strong>
    <slot />
  </strong>
</article>

<style>
  :global(.toast) {
    margin: 0 auto;
    min-width: 20rem;
  }
</style>
