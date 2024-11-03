<script lang="ts">
  export let label: null | string = null;
  export let name: null | string = null;
  export let small = false;
</script>

<div class="field">
  {#if label && name}
    <label for={name} class="label" class:is-small={small}>{label}</label>
  {/if}
  <div class="control">
    <slot />
  </div>
</div>
