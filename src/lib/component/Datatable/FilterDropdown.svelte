<script lang="ts">
  import FieldH from '$lib/component/FieldH.svelte';
</script>

<FieldH id="active" label="Active">
  <select name="active" class="input is-small is-rounded">
    <option value="-1">All</option>
    <option value="1">Active</option>
    <option value="0">Inactive</option>
  </select>
</FieldH>
<FieldH id="teamlead" label="Teamlead">
  <select name="teamlead" id="teamlead" class="input is-small is-rounded">
    <option value="-1">All</option>
  </select>
</FieldH>
<FieldH id="region" label="Region">
  <select name="region" id="region" class="input is-small is-rounded">
    <option value="APAC">APAC</option>
    <option value="EMEA">EMEA</option>
    <option value="NA">North America</option>
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
