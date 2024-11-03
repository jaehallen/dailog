<script context="module" lang="ts">
  export const getDistinct = (items: string[]) => {
    return Array.from(new Set(items));
  };
</script>

<script lang="ts">
  export let filterValue;
  export let preFilteredValues;
  $: uniqueValues = getDistinct($preFilteredValues);
  const format = (v: string | number | boolean) => {
    if (typeof v === 'boolean') {
      return v ? 'Yes' : 'No';
    }

    if (v === null || v === undefined) {
      return '(Blank)';
    }

    return v;
  };
</script>

<div class="field">
  <div class="control">
    <select class="input is-small is-rounded" bind:value={$filterValue} on:click|stopPropagation>
      <option value={undefined}>All</option>
      {#each uniqueValues as value}
        <option {value}>{format(value)}</option>
      {/each}
    </select>
  </div>
</div>
