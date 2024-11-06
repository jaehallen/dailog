<script lang="ts">
  import type { User } from 'lucia';
  import type { UsersList } from '$lib/types/schema';
  import type { Writable } from 'svelte/store';
  import { CalendarCog, UserRoundPen, History } from 'lucide-svelte';
  import ButtonIcon from '../ButtonIcon.svelte';
  import { getContextUpdate } from '$lib/context';
  import { fly } from 'svelte/transition';
  import { TEMPID } from '$lib/defaults';

  export let user: User | null;
  export let data: UsersList;
  export let isSelected: Writable<boolean>;
  export let allRowsSelected: Writable<boolean>;
  const { editUser, isBatchUpdate } = getContextUpdate();

  const onUpdate = (type: 'sched' | 'user') => {
    editUser.edit(type, data.id);
    $allRowsSelected = false;
    $isSelected = true;
  };
</script>

<div class="field wh-fixed is-grouped is-grouped-centered">
  {#if !$isBatchUpdate}
    <div class="control" in:fly={{ delay: 200, duration: 200, x: '1rem' }}>
      <div class="buttons">
        {#if user?.role == 'admin'}
          <ButtonIcon small disabled={!data.region} on:click={() => onUpdate('user')}>
            <UserRoundPen />
          </ButtonIcon>
        {/if}
        <ButtonIcon small disabled={!data.region} on:click={() => onUpdate('sched')}>
          <CalendarCog />
        </ButtonIcon>
        <ButtonIcon small>
          <History/>
        </ButtonIcon>
      </div>
    </div>
  {:else}
    <div class="control" in:fly={{ delay: 200, duration: 200, x: '1rem' }}>
      <label class="checkbox">
        <input type="checkbox" bind:checked={$isSelected} disabled={data.id < TEMPID} />
      </label>
    </div>
  {/if}
</div>

<style>
  .wh-fixed {
    min-height: 30px;
  }
</style>
