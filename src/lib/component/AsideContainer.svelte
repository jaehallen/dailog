<script lang="ts">
  import { fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import { quintIn, quintOut } from 'svelte/easing';
  const dispatch = createEventDispatcher();
  const exit = () => dispatch('exit');
</script>

<aside
  class="aside-container my-1 p-4 card"
  in:fly={{ x: 100, duration: 300, delay: 100, easing: quintOut }}
  out:fly={{ x: 100, duration: 300, easing: quintIn }}
>
  <button class="delete" on:click={exit}></button>
  <slot />
</aside>

<style>
  .aside-container {
    min-width: 500px;
    right: 20px;
    bottom: 15px;
    position: fixed;
    overflow-x: hidden;
    z-index: 99;
  }

  @media (max-width: 480px) {
    .aside-container {
      position: relative;
      width: 100%;
    }
  }

  @media (max-width: 1024px) {
    .aside-container {
      position: fixed;
      width: 500px;
    }
  }
</style>
