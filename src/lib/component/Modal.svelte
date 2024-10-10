<script lang="ts">
  export let isActive = false;
</script>

<div class="modal" class:is-active={isActive}>
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="card">
      <div class="card-content">
        <div class="content subtitle">
          <slot name="message" />
        </div>
      </div>
      {#if $$slots.default}
        <footer class="card-footer">
          <slot />
        </footer>
      {/if}
    </div>
  </div>
</div>
