<script lang="ts">
  import ButtonIcon from '../ButtonIcon.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { User } from 'lucia';
  import { CalendarCog, UserRoundPen } from 'lucide-svelte';

  export let user: User | null;
  export let row;
  const dispatch = createEventDispatcher();
</script>

<div class="buttons">
  {#if user?.role == 'admin'}
    <ButtonIcon small disabled={!row.original.region} on:click={() => console.log(row)}>
      <UserRoundPen />
    </ButtonIcon>
  {/if}
  <ButtonIcon small disabled={!row.original.region} on:click={() => dispatch('sched')}>
    <CalendarCog />
  </ButtonIcon>
</div>
