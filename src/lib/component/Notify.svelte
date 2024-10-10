<script lang="ts">
  let message = '';
  let isActive = false;
  let danger = false;
  export function notify(msg: string, isDanger: boolean = false) {
    message = msg;
    danger = isDanger;
    isActive = true;
  }
</script>

<div class="modal" class:is-active={isActive}>
  <div class="modal-content">
    <div class="notification is-centered" class:is-danger={danger} class:is-success={!danger}>
      <button class="delete" on:click={() => (isActive = false)}></button>
      <p class="is-centered"><strong>{@html message}</strong></p>
    </div>
  </div>
</div>
