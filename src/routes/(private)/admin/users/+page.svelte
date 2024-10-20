<script lang="ts">
  import type { ScheduleRecord, UsersList } from '$lib/types/schema';
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';
  import AsideContainer from '$lib/component/AsideContainer.svelte';
  import UserInputs from '$lib/component/UserInputs.svelte';
  import ScheduleInputs from '$lib/component/ScheduleInputs.svelte';
  import { slide } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { Pagination, FilterDropdown, SearchUser } from '$lib/component/Datatable';
  import { FilterX, UserRoundPen, CalendarCog } from 'lucide-svelte/icons';
  import { Subscribe, Render } from 'svelte-headless-table';
  import { readable } from 'svelte/store';
  import { getUsersTable } from '$lib/table-users';
  import UserScheduleTable from '$lib/component/UserScheduleTable.svelte';
  import type { SubmitFunction } from '@sveltejs/kit';

  export let data: PageData;
  let advanceFilter = true;
  let userUpdate = false;
  let disabled = false;
  let show: 'sched' | 'user';
  let itemId = 0;
  let selectedUserScheds: {
    schedules: ScheduleRecord[];
    exclude: (keyof ScheduleRecord)[];
  } = {
    schedules: [],
    exclude: ['id', 'clock_dur_min', 'break_dur_min', 'lunch_dur_min']
  };
  let selectedUserInfo: Omit<UsersList, 'teamlead' | 'latest_schedule' | 'schedules'> = {
    id: 0,
    name: '',
    lead_id: 0,
    region: '',
    active: true,
    role: 'user',
    lock_password: false
  };

  const { headerRows, rows, tableAttrs, tableBodyAttrs, pluginStates } = getUsersTable(
    readable(data.listOfUsers)
  );
  const { filterValues } = pluginStates.filter;
  $: hasFilter = Object.values($filterValues).filter((v) => v !== undefined && v !== '').length;

  const closePopup = (e: KeyboardEvent) => {
    if (e.key == 'Escape') {
      userUpdate = false;
    }
  };

  const onUserUpdate = (itemData: UsersList, showType: 'sched' | 'user') => {
    const { id, name, lead_id, region, active, role, lock_password } = itemData;
    show = showType;
    userUpdate = true;
    itemId = itemData.id;
    selectedUserInfo = { id, name, lead_id, region, active, role, lock_password };
    selectedUserScheds.schedules = itemData.schedules;
  };

  onMount(() => {
    window.addEventListener('keydown', closePopup);
    return () => {
      window.removeEventListener('keydown', () => {});
    };
  });

  const scheduleOnSubmit: SubmitFunction = ({ formData }) => {
    disabled = true;
    return async ({ update, result }) => {
      if (result.type === 'success') {
        console.log(result.data);
      } else {
        console.error(result);
      }
      await update({ invalidateAll: false, reset: false });
      disabled = false;
    };
  };
</script>

{#if userUpdate}
  {#if data.user?.role === 'admin' && show == 'user'}
    {#key itemId}
      <AsideContainer on:exit={() => (userUpdate = !userUpdate)}>
        <form action="?/update-user">
          <UserInputs
            {...selectedUserInfo}
            leads={data?.defaultOptions?.leads}
            regions={data?.defaultOptions?.regions}
          />
        </form>
      </AsideContainer>
    {/key}
  {:else if show == 'sched'}
    {#key itemId}
      <AsideContainer on:exit={() => (userUpdate = !userUpdate)}>
        <UserScheduleTable {...selectedUserScheds} />
        <form action="?/add-schedule" method="POST" use:enhance={scheduleOnSubmit}>
          <ScheduleInputs schedule={selectedUserScheds.schedules[0]} user_id={itemId} {disabled} />
        </form>
      </AsideContainer>
    {/key}
  {/if}
{/if}
<main class="container mt-4">
  <div class="grid mb-1">
    <div class="cell">
      <div class="cell">
        {#if advanceFilter}
          <form transition:slide={{ duration: 200 }} action="" class="block">
            <FilterDropdown />
          </form>
        {:else}
          <form transition:slide={{ duration: 200 }} action="" class="block">
            <SearchUser />
          </form>
        {/if}
      </div>
    </div>
    <div class="cell"></div>
    <div class="cell">
      <Pagination on:advfilter={() => (advanceFilter = !advanceFilter)} />
    </div>
  </div>
  <table class="table is-hoverable is-fullwidth is-striped" {...$tableAttrs}>
    <thead class="">
      {#each $headerRows as headerRow (headerRow.id)}
        <Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
          <tr {...rowAttrs}>
            <th
              >No.
              <div>
                <button
                  class={`button is-small  + ${hasFilter ? 'is-danger is-light' : 'is-text'}`}
                  on:click={() => ($filterValues = {})}
                  ><span class="icon is-small">
                    <FilterX />
                  </span></button
                >
              </div>
            </th>

            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                <th {...attrs}>
                  <Render of={cell.render()} />
                  {#if props.filter?.render}
                    <div class="has-text-centered">
                      <Render of={props.filter?.render} />
                    </div>
                  {/if}
                </th>
              </Subscribe>
            {/each}
          </tr>
        </Subscribe>
      {/each}
    </thead>
    <tbody {...$tableBodyAttrs}>
      {#each $rows as row (row.id)}
        <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
          {#if row.isData()}
            <tr {...rowAttrs} class:is-selected={itemId === row.original.id}>
              <td>
                <div class="buttons">
                  <button
                    class="button is-small"
                    on:click={() => onUserUpdate(row.original, 'user')}
                    ><span title={`Edit ${row.original.name} Info`} class="icon is-small"
                      ><UserRoundPen /></span
                    ></button
                  >
                  <button
                    class="button is-small"
                    on:click={() => onUserUpdate(row.original, 'sched')}
                    ><span title={`${row.original.name} Schedule`} class="icon is-small"
                      ><CalendarCog /></span
                    ></button
                  >
                </div>
              </td>
              {#each row.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs>
                  <td
                    {...attrs}
                    class={row.original.lock_password ? 'has-text-danger is-italic' : ''}
                  >
                    <Render
                      of={cell.isData() && cell.value != null && cell.value != undefined
                        ? cell.render()
                        : '-'}
                    />
                  </td>
                </Subscribe>
              {/each}
            </tr>
          {/if}
        </Subscribe>
      {/each}
    </tbody>
  </table>
</main>

<style>
  table {
    border-collapse: separate;
  }

  thead {
    position: sticky;
    inset-block-start: 0;
    background: var(--bulma-scheme-main) !important;
    z-index: 1;
  }

  .filter-panel {
    width: 300px;
  }
</style>
