<script lang="ts">
  export let small = false;
  export let disabled = false;
  export let buttonType = '';
  export let round = false;
  $: buttonClass = 'button '+buttonType+' '+ ($$props.class || '')
</script>

<button class:is-small={small} class:is-rounded={round} {disabled} class={buttonClass} {...$$props} on:click>
  <span class="icon is-small">
    <slot />
  </span>
</button>
