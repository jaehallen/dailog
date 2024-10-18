<script lang="ts">
  import { fly, slide } from 'svelte/transition';
  import {createEventDispatcher} from 'svelte';
  import { quintInOut, quintOut } from 'svelte/easing';
  const dispatch = createEventDispatcher();
  const exit = () => dispatch('exit')
</script>

<aside class="aside-container my-1 p-4 card" transition:slide={{duration: 200}}>
  <button class="delete" on:click={exit}></button>
  <slot />
</aside>

<style>
  @media (max-width: 480px) {
    .aside-container {
      position: relative;
      width: 100%;
    }
  }

  @media (max-width: 1024px) {
    .aside-container {
      position: fixed;
      width: 400px;
    }
  }

  :global(.aside-container) {
    height: 80vh;
    min-width: 500px;
    right:20px;
    top:10%;
    bottom: 0;
    position: fixed;
    overflow-x: hidden;
    z-index: 99;
  }
</style>
