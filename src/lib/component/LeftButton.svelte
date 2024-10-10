<script lang="ts">
  import ChevronLeft from 'lucide-svelte/icons/chevron-left';
  import { createEventDispatcher } from 'svelte';

  export let disabled = false;
  const dispatch = createEventDispatcher();
</script>

<button class="button is-small is-text" on:click={() => dispatch('left')} {disabled}>
  <ChevronLeft />
</button>
