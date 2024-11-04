<script lang="ts">
  import type { User } from 'lucia';
  import FieldH from './FieldH.svelte';
  export let user: User | null;
  export let disabled;

  let { avatar_src = '', background_src = '' } = user?.preferences || {};
  let isDirty = false;

  const onInput = () => {
    isDirty = true;
  };
</script>

<fieldset class="box">
  <legend>Preferences</legend>
  <FieldH id="avatar_src" label="Avatar">
    <input
      class="input"
      type="url"
      id="avatar_src"
      name="avatar_src"
      value={avatar_src}
      on:input={onInput}
    />
    <p class="help">URL of your Avatar</p>
  </FieldH>
  <FieldH id="background_src" label="BG">
    <input
      type="url"
      class="input"
      id="background_src"
      name="background_src"
      value={background_src}
      on:input={onInput}
    />
    <p class="help">URL of your Background</p>
  </FieldH>
  <div class="field is-grouped is-grouped-right">
    <p class="control">
      <button class="button is-primary" disabled={disabled || !isDirty}> Save </button>
    </p>
  </div>
</fieldset>
