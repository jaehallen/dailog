<script lang="ts">
  import type { OptRole } from '$lib/types/schema';
  import { USERROLE } from '$lib/defaults';
  import FieldH from './FieldH.svelte';
  export let id: number;
  export let name: string;
  export let lead_id: number;
  export let region: string;
  export let active: Boolean;
  export let role: OptRole;
  export let lock_password: Boolean;
  export let regions: string[] = [];
  export let leads: { id: number; name: string }[] = [];

  $: lockpassStr = lock_password ? '1' : '0';
  $: activeStr = active ? '1' : '0';
</script>

<h4 class="title is-4">{name}</h4>
<h6 class="subtitle is-6">
  <button class="button is-ghost p-0" formaction="?/password-reset"> Reset Password </button>
</h6>

<FieldH id="id" label="GAID">
  <input type="number" class="input is-static" readonly value={id} />
</FieldH>
<FieldH id="name" label="Name">
  <input type="text" class="input" id="name" name="name" value={name} />
</FieldH>
<FieldH id="lead_id" label="Teamlead">
  <select name="lead_id" id="lead_id" class="input">
    <option value="">(Blank)</option>
    {#each leads as lead (lead.id)}
      <option value={lead_id} selected={lead.id === lead_id}>{lead.name}</option>
    {/each}
  </select>
</FieldH>
<FieldH id="region" label="Region">
  <select name="region" id="region" class="input">
    <option value="">(Blank)</option>
    {#each regions as optRegion}
      <option value={optRegion} selected={optRegion == region}>{optRegion}</option>
    {/each}
  </select>
</FieldH>
<FieldH id="active" label="Active">
  <select name="active" id="active" class="input" bind:value={activeStr}>
    <option value="1">Yes</option>
    <option value="0">No</option>
  </select>
  {#if activeStr === '0'}
    <p class="help is-danger">User Login Disabled</p>
  {/if}
</FieldH>
<FieldH id="role" label="Role">
  <select name="role" id="role" class="input" value={role}>
    {#each USERROLE as role}
      <option value={role}>{role}</option>
    {/each}
  </select>
</FieldH>
<FieldH id="lock_password" label="Lock">
  <select name="lock_password" id="lock_password" class="input" bind:value={lockpassStr}>
    <option value="1">Yes</option>
    <option value="0">No</option>
  </select>
  {#if lockpassStr === '1'}
    <p class="help is-danger">Password Reset Block</p>
  {/if}
</FieldH>
<div class="field is-grouped is-grouped-right">
  <p class="control">
    <button class="button is-primary"> Update Info </button>
  </p>
</div>
