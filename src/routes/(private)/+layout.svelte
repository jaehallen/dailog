<script lang="ts">
  import type { LayoutData } from './$types';
  import LayoutHeader from '$lib/component/LayoutHeader.svelte';
  import { ModeWatcher } from 'mode-watcher';
  import { page } from '$app/stores';
  export let data: LayoutData;
  const src = data?.user?.preferences?.background_src || '';
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css" />
</svelte:head>

<div>
  <ModeWatcher />
  <LayoutHeader
    user={data?.user ?? null}
    routeList={data.routeList || []}
    curPath={$page.url.pathname}
  />
  <main
    class="hero is-fullheight-with-navbar"
    class:hero-section={Boolean(src)}
    style:--background-image-url="url({src})"
  >
    <slot />
  </main>
</div>

<style>
  .hero-section {
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 22.16%),
      linear-gradient(270deg, rgba(0, 0, 0, 0) 38.11%, rgba(0, 0, 0, 0.5) 99.84%),
      var(--background-image-url) lightgray 50% / cover no-repeat;
    background-size: cover;
    background-position: center;
  }
  @media (max-width: 640px) {
    .hero-section {
      background-image:
        linear-gradient(0deg, rgba(0, 0, 0, 0) 76.81%, rgba(0, 0, 0, 0.5) 99.83%),
        linear-gradient(180deg, rgba(0, 0, 0, 0) 48.56%, rgba(0, 0, 0, 0.8) 100%),
        var(--background-image-url) lightgray 50% / cover no-repeat;
    }
  }

  /* Chrome, Safari, Edge, Opera */
  :global(input::-webkit-outer-spin-button, input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  :global(input[type='number']) {
    -moz-appearance: textfield;
  }
</style>
