<script lang="ts">
  import ButtonIcon from '../ButtonIcon.svelte';
  import type { User } from 'lucia';
  import { CalendarCog, UserRoundPen } from 'lucide-svelte';
  import { getContextUpdate } from '$lib/context';
  import type { UsersList } from '$lib/types/schema';
  import { fly } from 'svelte/transition';
  import type { Writable } from 'svelte/store';

  export let user: User | null;
  export let data: UsersList;
  export let isSelected: Writable<boolean>;
  export let allRowsSelected: Writable<boolean>;
  const { editUser, isBatchSched } = getContextUpdate();
  const randomId = () => Math.floor(Math.random() * 10000);

  const onUpdate = (type: 'sched' | 'user') => {
    $editUser = {
      updateId: randomId(),
      showType: type,
      selectedId: data.id,
      isEdit: true
    };

    $allRowsSelected = false;
    $isSelected = true;
  };
</script>

<div class="field wh-fixed is-grouped is-grouped-centered">
  {#if !$isBatchSched}
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
      </div>
    </div>
  {:else}
    <div class="control" in:fly={{ delay: 200, duration: 200, x: '1rem' }}>
      <label class="checkbox">
        <input type="checkbox" bind:checked={$isSelected} />
      </label>
    </div>
  {/if}
</div>

<style>
  .wh-fixed {
    min-height: 30px;
  }
</style>
