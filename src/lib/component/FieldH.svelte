<script lang="ts">
  export let id: string;
  export let label: string;
  export let small = true;
</script>

<div class="field is-horizontal">
  <div class="field-label" class:is-small={small}>
    <label for={id} class="label"> {label} </label>
  </div>
  <div class="field-body">
    <div class="field">
      <div class="control">
        <slot />
      </div>
    </div>
  </div>
</div>
