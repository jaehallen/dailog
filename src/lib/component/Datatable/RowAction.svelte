<script lang="ts">
  import ButtonIcon from '../ButtonIcon.svelte';
  import type { User } from 'lucia';
  import { CalendarCog, UserRoundPen } from 'lucide-svelte';
  import { getContextUpdate } from '$lib/context';
  import type { UsersList } from '$lib/types/schema';
  import RowActionHeader from './RowActionHeader.svelte';

  export let user: User | null;
  export let data: UsersList;
  const updateInfo = getContextUpdate();
  const randomId = () => Math.floor(Math.random() * 10000)

  function userUpdate() {
    $updateInfo = {
      updateId: randomId(),
      showType: 'user',
      itemId: data.id,
      onUpdate: true
    };
  }
  function schedUpdate() {
    $updateInfo = {
      updateId: randomId(),
      showType: 'sched',
      itemId: data.id,
      onUpdate: true
    };
  }
</script>

<div class="buttons">
  {#if user?.role == 'admin'}
    <ButtonIcon small disabled={!data.region} on:click={userUpdate}>
      <UserRoundPen />
    </ButtonIcon>
  {/if}
  <ButtonIcon small disabled={!data.region} on:click={schedUpdate}>
    <CalendarCog />
  </ButtonIcon>
</div>
