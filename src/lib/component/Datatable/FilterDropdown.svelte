<script lang="ts">
  import FieldH from '$lib/component/FieldH.svelte';
  import type { User } from 'lucia/dist/core';
  export let leads: { id: number; name: string }[] = [];
  export let regions: string[] = [];
  export let user: Partial<User>;
  let activeStr = '-1';
</script>

<FieldH id="temp_a" label="Active" small={true}>
  <input class="is-hidden" type="number" name="active" value={Number(activeStr)} />
  <select name="active" id="active" class="input is-small is-rounded" bind:value={activeStr}>
    <option value="-1">All</option>
    <option value="1">Yes</option>
    <option value="0">No</option>
  </select>
</FieldH>
<FieldH id="lead_id" label="Teamlead" small={true}>
  <select name="lead_id" id="lead_id" class="input is-small is-rounded">
    <option value="-1">All</option>
    {#each leads as lead (lead.id)}
      <option value={lead.id} selected={lead.id === user?.id}>{lead.name}</option>
    {/each}
  </select>
</FieldH>
<FieldH id="region" label="Region" small={true}>
  <select name="region" id="region" class="input is-small is-rounded">
    {#each regions as optRegion}
      <option value={optRegion} selected={optRegion == user?.region}>{optRegion}</option>
    {/each}
  </select>
</FieldH>
<div class="field is-horizontal">
  <div class="field-label">
    <!-- Left empty for spacing -->
  </div>
  <div class="field-body">
    <div class="field">
      <div class="control">
        <button class="button is-small is-rounded"> Filter </button>
      </div>
    </div>
  </div>
</div>
