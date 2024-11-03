<script lang="ts">
  import type { Readable, Writable } from 'svelte/store';

  export let filterValue: Writable<string>;
</script>

<div class="field">
  <div class="control">
    <input
      class="input is-small is-rounded"
      type="text"
      bind:value={$filterValue}
      placeholder="filter..."
    />
  </div>
</div>
