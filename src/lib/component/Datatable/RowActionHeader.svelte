<script lang="ts">
  import { FilterX } from "lucide-svelte";
  import ButtonIcon from "../ButtonIcon.svelte";

  export let filterValues
  let hasFilter = false;
</script>

<div>

  Action
  <div>
    <ButtonIcon
      small
      display={hasFilter ? 'is-danger is-light' : 'is-text'}
      on:click={() => ($filterValues = {})}
    >
      <FilterX />
    </ButtonIcon>
  </div>
</div>
