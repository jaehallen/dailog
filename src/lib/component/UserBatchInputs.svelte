<script lang="ts">
  import FieldH from './FieldH.svelte';
  export let regions: string[] = [];
  export let leads: { id: number; name: string }[] = [];
  export let disabled = false;
  export let selectedIds: Record<string, boolean> = {};
  let lockpassStr = '';
  let leadId = '';
</script>

<fieldset class="box">
  <legend>Set User Info</legend>
  <input type="hidden" id="ids_list" name="ids_list" value={Object.keys(selectedIds).join('_')} />
  <FieldH id="lead_id" label="Teamlead">
    <select name="lead_id" id="lead_id" class="input" bind:value={leadId}>
      <option value="">Do not set</option>
      {#each leads as lead (lead.id)}
        <option value={lead.id}>{lead.name}</option>
      {/each}
    </select>
  </FieldH>
  <FieldH id="region" label="Region">
    <select name="region" id="region" class="input">
      <option value="">Do not set</option>
      {#each regions as optRegion}
        <option value={optRegion}>{optRegion}</option>
      {/each}
    </select>
  </FieldH>
  <FieldH id="temp_b" label="Lock">
    <select id="lock_password" class="input" name="lock_password" bind:value={lockpassStr}>
      <option value="">Do not set</option>
      <option value="1">Yes</option>
      <option value="0">No</option>
    </select>
    {#if lockpassStr === '1'}
      <p class="help is-danger">Password Reset Disabled</p>
    {/if}
  </FieldH>
  <div class="field is-grouped is-grouped-right">
    <p class="control">
      <button class="button is-primary" {disabled}> Update Users </button>
    </p>
  </div>
</fieldset>
