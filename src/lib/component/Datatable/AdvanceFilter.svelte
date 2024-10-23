<script lang="ts">
  import type { User } from 'lucia';
  import { ChevronRight, ChevronLeft } from 'lucide-svelte/icons';
  export let user: Partial<User>;
  export let regions: string[] = [];
  export let leads: { id: number; name: string }[] = [];
  export let disabled = false;
</script>

<div class="level">
  <div class="level-left">
    <div class="level-item">
      <div class="field has-addons">
        <div class="control">
          <input type="search" class="input is-small is-rounded" placeholder="Search user..." {disabled}/>
        </div>
        <div class="control">
          <button class="button is-small is-rounded">Search</button>
        </div>
      </div>
    </div>
  </div>
  <div class="level-right">
    <div class="level-item has-text-centered">
      <div class="field has-addons">
        <div class="control">
          <button class="button is-static is-small is-rounded" {disabled}>Active</button>
        </div>
        <div class="control">
          <div class="select is-small is-rounded">
            <select name="active">
              <option value="-1">All</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div class="field has-addons">
        <div class="control">
          <button class="button is-static is-small is-rounded" {disabled}>Region</button>
        </div>
        <div class="control">
          <div class="select is-small is-rounded">
            <select name="region">
              {#each regions as region, id (id)}
                <option value={region}>{region}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div class="field has-addons">
        <div class="control">
          <button class="button is-static is-small is-rounded">Teamlead</button>
        </div>
        <div class="control">
          <div class="select is-small is-rounded">
            <select name="lead_id" {disabled}>
              <option value="-1">All</option>
              {#each leads as lead (lead.id)}
                <option value={lead.id} selected={lead.id === user?.id}>{lead.name}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="level-item">
      <button class="button is-small is-rounded is-primary" {disabled}> Apply </button>
    </div>
    <div class="level-item">
      <select class="input is-small is-rounded" { disabled }>
        <option value="50">50 rows</option>
        <option value="100">100 rows</option>
        <option value="500">500 rows</option>
      </select>
    </div>
    <div class="level-item">
      <button class="button is-small is-rounded" { disabled }>
        <span class="icon is-small">
          <ChevronLeft />
        </span>
      </button>
    </div>
    <div class="level-item">
      <button class="button is-small is-rounded" { disabled }>
        <span class="icon is-small">
          <ChevronRight />
        </span>
      </button>
    </div>
  </div>
  <!-- </div> -->
</div>
