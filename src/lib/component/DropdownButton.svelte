<script lang="ts">
  import ChevronDown from 'lucide-svelte/icons/chevron-down';
  import ChevronUp from 'lucide-svelte/icons/chevron-up';
  export let dropup = false;
  export let small = false;
  export let label = '';
  export let display = '';
  let isDropdown = false;
</script>

<div class="dropdown" class:is-up={dropup} class:is-active={isDropdown}>
  <div class="dropdown-trigger">
    <button class={`button ${display}`} type="button" class:is-small={small} on:click={() => (isDropdown = !isDropdown)}>
      <span>{label}</span>
      <span class="icon" class:is-small={small}>
        {#if (dropup && !isDropdown) || (!dropup && isDropdown)}
          <ChevronUp />
        {:else if (!dropup && !isDropdown) || (dropup && isDropdown)}
          <ChevronDown />
        {/if}
      </span>
    </button>
  </div>
  <div class="dropdown-menu" role="menu">
    <div class="dropdown-content">
        <slot/>
    </div>
  </div>
</div>
