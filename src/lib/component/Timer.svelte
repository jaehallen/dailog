<script lang="ts">
  import { readable } from 'svelte/store';
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';

  const dispatch = createEventDispatcher();
  const f = (v: number) => String(v).padStart(2, '0');
  export let timestamp: number;
  export let isNotify = false;

  const time = readable(0, (set) => {
    const interval = setInterval(() => {
      set(Math.floor(Date.now() / 1000 - timestamp));
    }, 1000);

    return () => clearInterval(interval);
  });

  onMount(() => {
    let notify = undefined
    if (isNotify && browser && 'Notification' in window && Notification.permission == 'granted') {
      notify = setInterval(() => {
        dispatch('notify', $time);
      }, 60000);
    }

    return () => clearInterval(notify);
  });

  $: hh = Math.floor($time / 3600);
  $: mm = Math.floor(($time - hh * 3600) / 60);
  $: ss = $time - hh * 3600 - mm * 60;
</script>

<span class:has-skeleton={$time < 0}>
  <span>{f(hh)}</span>:
  <span>{f(mm)}</span>:
  <span>{f(ss)}</span>
</span>
