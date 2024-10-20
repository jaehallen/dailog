<script lang="ts">
  export let id: string;
  export let label: string;
  export let small = false;
</script>

<div class="field is-horizontal">
  <div class="field-label" class:is-small={small} class:is-normal={!small}>
    <label for={id} class="label pt-1"> {label} </label>
  </div>
  <div class="field-body">
    <div class="field">
      <div class="control">
        <slot />
      </div>
    </div>
  </div>
</div>
