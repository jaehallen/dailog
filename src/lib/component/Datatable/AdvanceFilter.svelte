<script lang="ts">
  import type { SearchOptions } from '$lib/validation';
  import type { User } from 'lucia';
  import { isAdmin } from '$lib/utility';
  import { ChevronRight, ChevronLeft, SlidersHorizontal } from 'lucide-svelte/icons';
  import {usersData} from '$lib/table-users';
  export let user: Partial<User>;
  export let regions: string[] = [];
  export let leads: { id: number; name: string; region: string }[] = [];
  export let disabled = false;
  export let queries: Partial<SearchOptions> = {};
  let onFilter = false;
  let username = queries.username;
  let tempLeads = leads.filter((l) => isAdmin(user.role) || l.region === user.region);
  let tempRegions = regions.filter((r) => isAdmin(user.role) || r === user.region);
  $: isMaxSize = $usersData.length < (queries?.limit ?? 0)
</script>

<div class="level">
  <div class="level-left">
    <div class="level-item">
      <div class="field has-addons">
        <div class="control">
          <input
            type="number"
            name="last_id"
            value={queries.last_id || 0}
            class="is-hidden"
            readonly
          />
          <input
            type="text"
            class="input is-small is-rounded"
            placeholder="Search user..."
            name="username"
            bind:value={username}
            {disabled}
          />
        </div>
        <div class="control">
          <button class="button is-small is-rounded" {disabled}>Search</button>
        </div>
      </div>
    </div>
  </div>
  <div class="level-right">
    <div class="level-item has-text-centered">
      <button
        type="button"
        class="button is-small is-rounded"
        on:click={() => (onFilter = !onFilter)}
      >
        <span class="icon is-small">
          <SlidersHorizontal />
        </span>
      </button>
    </div>
    <div class="level-item has-text-centered" class:is-hidden={!onFilter}>
      <div class="field is-horizontal">
        <div class="field-body">
          <div class="field has-addons">
            <div class="control">
              <button class="button is-static is-small is-rounded" {disabled}>Active</button>
            </div>
            <div class="control">
              <div class="select is-small is-rounded">
                <select name="active" value={String(queries.active || '')}>
                  <option value="">All</option>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
            </div>
          </div>
          <div class="field has-addons">
            <div class="control">
              <button class="button is-static is-small is-rounded" {disabled}>Region</button>
            </div>
            <div class="control">
              <div class="select is-small is-rounded is-static">
                <select name="region" class="is-static" value={queries.region || user.region || ''}>
                  {#if tempRegions.length > 1}
                    <option value="">All</option>
                  {/if}
                  {#each tempRegions as region, id (id)}
                    <option value={region}>{region}</option>
                  {/each}
                </select>
              </div>
            </div>
          </div>
          <div class="field has-addons">
            <div class="control">
              <button class="button is-static is-small is-rounded">Teamlead</button>
            </div>
            <div class="control">
              <div class="select is-small is-rounded">
                <select name="lead_id" {disabled} value={queries.lead_id ?? ''}>
                  <option value="">All</option>
                  {#each tempLeads as lead (lead.id)}
                    <option value={lead.id}>{lead.name}</option>
                  {/each}
                </select>
              </div>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <select class="input is-small is-rounded" name="limit" {disabled} value={String(queries.limit || 50)}>
                <option value="50">50 rows</option>
                <option value="100">100 rows</option>
                <option value="500">500 rows</option>
              </select>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <button type="submit" class="button is-small is-rounded is-primary" {disabled}>
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <button class="button is-small is-rounded" disabled={disabled || Boolean(username) || isMaxSize}>
        <span class="icon is-small">
          <ChevronLeft />
        </span>
      </button>
    </div>
    <div class="level-item has-text-centered">
      <button class="button is-small is-rounded" disabled={disabled || Boolean(username) || isMaxSize}>
        <span class="icon is-small">
          <ChevronRight />
        </span>
      </button>
    </div>
  </div>
</div>
