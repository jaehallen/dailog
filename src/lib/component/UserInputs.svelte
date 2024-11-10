<script lang="ts">
  import type { UserRecord } from '$lib/types/schema';
  import type { User } from 'lucia';
  import { USERROLE } from '$lib/defaults';
  import FieldH from './FieldH.svelte';
  export let user: Omit<UserRecord, 'password_hash' | 'preferences'>;
  export let regions: string[] = [];
  export let leads: { id: number; name: string }[] = [];
  export let disabled = false;
  export let editor: Partial<User> = {};
  let activeStr = user.active ? '1' : '0';
  let lockpassStr = user.lock_password ? '1' : '0';
  let roles = USERROLE.filter((role) => editor.id === 100000 || role !== 'admin');
</script>

<h4 class="title is-4">{user.name}</h4>
<h6 class="subtitle is-6">
  <button class="button is-ghost p-0" formaction="?/password-reset"> Reset Password </button>
</h6>

<FieldH id="id" label="GAID">
  <input type="number" class="input is-static" name="id" readonly value={user.id} />
</FieldH>
<FieldH id="name" label="Name">
  <input type="text" class="input" name="name" value={user.name} />
</FieldH>
<FieldH id="lead_id" label="Teamlead">
  <select name="lead_id" id="lead_id" class="input">
    {#each leads as lead (lead.id)}
      <option value={lead.id} selected={lead.id === user.lead_id}>{lead.name}</option>
    {/each}
  </select>
</FieldH>
<FieldH id="region" label="Region">
  <select name="region" id="region" class="input">
    {#each regions as optRegion}
      <option value={optRegion} selected={optRegion == user.region}>{optRegion}</option>
    {/each}
  </select>
</FieldH>
<FieldH id="role" label="Role">
  <select name="role" id="role" class="input" value={user.role}>
    {#each roles as role}
      <option value={role}>{role}</option>
    {/each}
  </select>
</FieldH>
<FieldH id="temp_a" label="Active">
  <input class="is-hidden" type="number" name="active" value={Number(activeStr)} />
  <select name="active" id="active" class="input" bind:value={activeStr}>
    <option value="1">Yes</option>
    <option value="0">No</option>
  </select>
  {#if activeStr === '0'}
    <p class="help is-danger">User Login Disabled</p>
  {/if}
</FieldH>
<FieldH id="temp_b" label="Lock">
  <input class="is-hidden" type="number" name="lock_password" value={Number(lockpassStr)} />
  <select id="lock_password" class="input" bind:value={lockpassStr}>
    <option value="1">Yes</option>
    <option value="0">No</option>
  </select>
  {#if lockpassStr === '1'}
    <p class="help is-danger">Password Reset Blocked</p>
  {/if}
</FieldH>
<div class="field is-grouped is-grouped-right">
  <p class="control">
    <button class="button is-primary" {disabled}> Update Info </button>
  </p>
</div>
