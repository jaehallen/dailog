<script lang="ts">
  import type { SelectedRowsState } from 'svelte-headless-table/plugins';
  import type { Writable } from 'svelte/store';
  import ButtonIcon from '$lib/component/ButtonIcon.svelte';
  import DropdownButton from '../DropdownButton.svelte';
  import { FilterX } from 'lucide-svelte';
  import { getContextUpdate } from '$lib/context';
  import { fly } from 'svelte/transition';
  export let filterValues;
  export let select: SelectedRowsState<SelectedRows>;

  type SelectedRows = {
    allRowsSelected: Writable<boolean>;
    someRowsSelected: Writable<boolean>;
  };
  const { isBatchUpdate } = getContextUpdate();
  const { allRowsSelected, someRowsSelected } = select;
  $: hasFilter = Object.values($filterValues).filter((v) => v !== undefined && v !== '').length;
</script>

<div>
  <DropdownButton label="Action" display="is-ghost py-0 px-0">
      <button class="button is-small dropdown-item is-ghost">Update Users</button>
      <!-- <button class="button is-small dropdown-item is-ghost" on:click={}>Batch Updates</button>
      <button class="button is-small dropdown-item is-ghost" on:click={}>User Lastest Entries</button> -->
  </DropdownButton>
  <div class="buttons">
    <ButtonIcon
      small
      display={hasFilter ? 'is-danger is-light' : 'is-text'}
      on:click={() => ($filterValues = {})}
    >
      <FilterX />
    </ButtonIcon>
    {#if $isBatchUpdate}
      <label class="checkbox" transition:fly={{ duration: 400, x: '1rem' }}>
        <input
          type="checkbox"
          bind:checked={$allRowsSelected}
          indeterminate={$someRowsSelected && !$allRowsSelected}
        />
      </label>
    {/if}
  </div>
</div>
