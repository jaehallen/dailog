<script lang="ts">
</script>

<form action="" class="block">
  <div class="field is-horizontal">
    <div class="field-label is-small"><label for="username" class="label"> Active </label></div>
    <div class="field-body">
      <div class="field">
        <div class="control">
          <select name="active" class="input is-small">
            <option value="-1">All</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  </div>
  <div class="field is-horizontal">
    <div class="field-label is-small"><label for="teamlead" class="label"> Teamlead </label></div>
    <div class="field-body">
      <div class="field">
        <div class="control">
          <select name="teamlead" id="teamlead" class="input is-small">
            <option value="-1">All</option>
          </select>
        </div>
      </div>
    </div>
  </div>
  <div class="field is-horizontal">
    <div class="field-label is-small"><label for="region" class="label"> Region </label></div>
    <div class="field-body">
      <div class="field">
        <div class="control">
          <select name="region" id="region" class="input is-small">
            <option value="APAC">APAC</option>
            <option value="EMEA">EMEA</option>
            <option value="NA">North America</option>
          </select>
        </div>
      </div>
    </div>
  </div>
  <div class="field is-horizontal">
    <div class="field-label">
      <!-- Left empty for spacing -->
    </div>
    <div class="field-body">
      <div class="field">
        <div class="control">
          <button class="button is-primary is-small"> Filter </button>
        </div>
      </div>
    </div>
  </div>
</form>
