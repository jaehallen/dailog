<script lang="ts">
  import { Filter } from 'lucide-svelte/icons';
  import { createEventDispatcher } from 'svelte';
  export let pageCount: number = 1;
  export let pageSize: number = 10;
  export let pageIndex: number = 0;
  export let hasPreviousPage: boolean = false;
  export let hasNextPage: boolean = true;

  const dispatch = createEventDispatcher();
  const onFilter = () => {
    dispatch('advfilter')
  }
</script>

<div class="field is-grouped is-grouped-right">
  <button class="button is-ghost is-text" on:click={onFilter}>
    <span class="icon"><Filter /></span>
  </button>
  <p class="control is-expanded">
    <select class="input is-small">
      <option value="50">50 rows</option>
      <option value="100">100 rows</option>
      <option value="500">500 rows</option>
    </select>
  </p>
  <p class="control">
    <button class="button is-small">Previous</button>
  </p>
  <p class="control">
    <button class="button is-small">Next Page</button>
  </p>
</div>
