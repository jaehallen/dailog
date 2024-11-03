<script lang="ts">
  import type { User } from 'lucia';
  import FieldH from './FieldH.svelte';
  export let user: User | null;
  export let disabled;

  let avatar_src = user?.preferences?.avatar_src || '';
  let background_src = user?.preferences?.background_src || '';
  let avatarSrc = avatar_src;
  let bgSrc = background_src;

  $: isDirty = avatar_src !== avatarSrc || background_src !== bgSrc;
</script>

<fieldset class="box">
  <legend>Preferences</legend>
  <FieldH id="avatar_src" label="Avatar">
    <input class="input" type="url" name="avatar_src" bind:value={avatarSrc} />
    <p class="help">URL of your Avatar</p>
  </FieldH>
  <FieldH id="background_src" label="BG">
    <input type="url" class="input" name="background_src" bind:value={bgSrc} />
    <p class="help">URL of your Background</p>
  </FieldH>
  <div class="field is-grouped is-grouped-right">
    <p class="control">
      <button class="button is-primary" disabled={disabled || !isDirty}> Save </button>
    </p>
  </div>
</fieldset>
