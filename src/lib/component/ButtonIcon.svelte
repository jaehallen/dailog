<script lang="ts">
  export let small = false;
  export let disabled = false;
  export let display = '';
  export let round = false;
  $: buttonClass = 'button '+display+' '+ ($$props.class || '')
</script>

<button class:is-small={small} class:is-rounded={round} {disabled} class={buttonClass} {...$$props} on:click>
  <span class="icon" class:is-small={small}>
    <slot />
  </span>
</button>
