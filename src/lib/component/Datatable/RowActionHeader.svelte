<script lang="ts">
  import { FilterX } from 'lucide-svelte';
  import ButtonIcon from '../ButtonIcon.svelte';
  import { getContextSchedBatch } from '$lib/context';
  import { fly } from 'svelte/transition';
  import type { SelectedRowsState } from 'svelte-headless-table/plugins';
  import type { Writable } from 'svelte/store';

  type SelectedRows = {
    allRowsSelected: Writable<boolean>;
    someRowsSelected: Writable<boolean>;
  };
  export let filterValues;
  export let select: SelectedRowsState<SelectedRows>;
  const isBatchSched = getContextSchedBatch();
  const { allRowsSelected, someRowsSelected } = select;
  $: hasFilter = Object.values($filterValues).filter((v) => v !== undefined && v !== '').length;
</script>

<div>
  Action
  <div class="buttons">
    <ButtonIcon
      small
      display={hasFilter ? 'is-danger is-light' : 'is-text'}
      on:click={() => ($filterValues = {})}
    >
      <FilterX />
    </ButtonIcon>
    {#if $isBatchSched}
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
