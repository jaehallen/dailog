<script lang="ts">
  import type { SearchOptions } from '$lib/validation';
  import type { User } from 'lucia';
  import { isAdmin } from '$lib/utility';
  import { ChevronRight, ChevronLeft, SlidersHorizontal } from 'lucide-svelte/icons';
  import ButtonIcon from '../ButtonIcon.svelte';
  export let user: Partial<User>;
  export let regions: string[] = [];
  export let leads: { id: number; name: string; region: string }[] = [];
  export let disabled = false;
  export let queries: SearchOptions;
  let onFilter = false;
  let username = queries.username;
  let tempLeads = leads.filter((l) => isAdmin(user.role) || l.region === user.region);
  let tempRegions = regions.filter((r) => isAdmin(user.role) || r === user.region);

  $: pages = queries.page_index?.split('_').map((id) => Number(id)) || [];
  $: currentPage = pages.indexOf(queries.last_id) + 1;

  $: hasPrevPage = pages?.length > 1 && currentPage > 1;
  $: hasNextPage = queries.page_total !== pages.length || queries.page_total > currentPage;
</script>

<div class="is-hidden">
  <input type="number" name="last_id" value={queries.last_id || 0} readonly />
  <input type="number" name="page_total" value={queries.page_total || ''} readonly />
  <input type="text" name="page_index" value={queries.page_index || ''} readonly />
</div>
<div class="level">
  <div class="level-left">
    <div class="level-item">
      <div class="field has-addons">
        <div class="control">
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
      <ButtonIcon small round on:click={() => (onFilter = !onFilter)} buttonType="" type="button">
        <SlidersHorizontal />
      </ButtonIcon>
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
              <select
                class="input is-small is-rounded"
                name="limit"
                {disabled}
                value={String(queries.limit || 50)}
              >
                <option value="10">10 rows</option>
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
      <button
        class="button is-small is-rounded"
        formaction="?/prev-page"
        disabled={disabled || Boolean(username) || !hasPrevPage}
      >
        <span class="icon is-small">
          <ChevronLeft />
        </span>
      </button>
    </div>
    <div class="level-item has-text-centered">
      <button
        class="button is-small is-rounded"
        formaction="?/next-page"
        disabled={disabled || Boolean(username) || !hasNextPage}
      >
        <span class="icon is-small">
          <ChevronRight />
        </span>
      </button>
    </div>
  </div>
</div>
