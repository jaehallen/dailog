<script lang="ts">
  import { Filter } from 'lucide-svelte/icons';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  const onFilter = () => {
    dispatch('advfilter');
  };
</script>

<div class="field is-grouped is-grouped-right">
  <button class="button is-text is-small is-rounded" on:click={onFilter}>
    <span class="icon"><Filter /></span>
  </button>
  <p class="control">
    <select class="input is-small is-rounded">
      <option value="50">50 rows</option>
      <option value="100">100 rows</option>
      <option value="500">500 rows</option>
    </select>
  </p>
  <p class="control">
    <button class="button is-small is-rounded">Previous</button>
  </p>
  <p class="control">
    <button class="button is-small is-rounded">Next Page</button>
  </p>
</div>
