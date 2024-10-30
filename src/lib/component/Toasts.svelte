<script lang="ts">
  import Toast from './Toast.svelte';
  import { toasts } from '$lib/data-store';
</script>

{#if $toasts}
  <section class="all-toast">
    {#each $toasts as toast (toast.id)}
      <Toast type={toast.type} on:dismiss={() => toasts.dismiss(toast.id)}>
        {@html toast.message}
      </Toast>
    {/each}
  </section>
{/if}

<style>
  :global(.all-toast) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    display: flex;
    margin-top: 1rem;
    justify-content: center;
    flex-direction: column;
    z-index: 100;
  }
</style>
