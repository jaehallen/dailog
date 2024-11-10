<script lang="ts">
  export let text = '';
  export let typography = '';
</script>

<span class={typography}>{text}</span>

<style>
  :global(.remarks) {
    white-space: pre-wrap;
  }
</style>
