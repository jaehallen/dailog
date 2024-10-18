<script lang="ts">
  import FieldH from './FieldH.svelte';
  export let id: number;
  export let name: string;
  export let lead_id: number;
  export let region: string;
  export let active: number;
  export let role: string;
  export let lock_password: number;
</script>

<h4 class="title is-4">{name}</h4>
<h6 class="subtitle is-6">{id}</h6>
<FieldH id="name" label="Name" small={false}>
  <input type="text" class="input" id="name" name="name" value={name}/>
</FieldH>
<FieldH id="lead_id" label="Teamlead" small={false}>
  <select name="lead_id" id="lead_id" class="input" value={lead_id}>
    <option value="411055">Teamlead</option>
  </select>
</FieldH>
<FieldH id="region" label="Region" small={false}>
  <select name="region" id="region" class="input" value={region}>
    <option value="APAC">APAC</option>
  </select>
</FieldH>
<FieldH id="active" label="Active" small={false}>
  <select name="active" id="active" class="input" value={active}>
    <option value="1">Yes</option>
    <option value="0">No</option>
  </select>
</FieldH>
<FieldH id="role" label="Role" small={false}>
  <select name="role" id="role" class="input" value={role}>
    <option value="admin">admin</option>
    <option value="user">user</option>
    <option value="lead">lead</option>
    <option value="poc">poc</option>
  </select>
</FieldH>
<FieldH id="lock_password" label="Lock" small={false}>
  <select name="lock_password" id="lock_password" class="input" value={lock_password}>
    <option value="1">Yes</option>
    <option value="0">No</option>
  </select>
  <p class="help is-danger">Prevent user from resetting the password</p>
</FieldH>
<div class="field is-horizontal">
  <div class="field-label">
    <!-- Left empty for spacing -->
  </div>
  <div class="field-body">
    <div class="field">
      <div class="control">
        <button class="button is-primary">
          Update Info
        </button>
      </div>
    </div>
  </div>
</div>