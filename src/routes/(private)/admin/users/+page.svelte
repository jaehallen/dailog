<script lang="ts">
  import type { ScheduleRecord, UsersList } from '$lib/types/schema';
  import type { PageData } from './$types';
  import type { SubmitFunction } from '@sveltejs/kit';
  import AsideContainer from '$lib/component/AsideContainer.svelte';
  import UserInputs from '$lib/component/UserInputs.svelte';
  import ScheduleInputs from '$lib/component/ScheduleInputs.svelte';
  import UserScheduleTable from '$lib/component/UserScheduleTable.svelte';
  import { enhance } from '$app/forms';
  import { fly } from 'svelte/transition';
  import { quintInOut, sineOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  import { AdvanceFilter } from '$lib/component/Datatable';
  import { FilterX, UserRoundPen, CalendarCog } from 'lucide-svelte/icons';
  import { Subscribe, Render } from 'svelte-headless-table';
  import { getUsersTable, usersData } from '$lib/table-users';
  import { validateUser } from '$lib/validation';
  import { replaceState } from '$app/navigation';
  import { page } from '$app/stores';

  export let data: PageData;

  let userUpdate = false;
  let disabled = false;
  let show: 'sched' | 'user';
  let itemId = 0;

  const OMIT_SCHED_COLUMN: (keyof ScheduleRecord)[] = [
    'id',
    'clock_dur_min',
    'break_dur_min',
    'lunch_dur_min'
  ];
  const { headerRows, rows, tableAttrs, tableBodyAttrs, pluginStates } = getUsersTable(usersData);
  const { filterValues } = pluginStates.filter;

  const closePopup = (e: KeyboardEvent) => {
    if (e.key == 'Escape') {
      userUpdate = false;
    }
  };

  const onUserUpdate = (itemData: UsersList, showType: 'sched' | 'user') => {
    show = showType;
    userUpdate = true;
    itemId = itemData.id;
  };

  const isDirty = (formData: FormData) => {
    const data = Object.fromEntries(formData);
    const valid = validateUser.safeParse(data);
    return (
      selectedUser &&
      valid.success &&
      Object.entries(valid.data).some(([key, val]) => selectedUser[key] !== val)
    );
  };

  const scheduleOnSubmit: SubmitFunction = ({ formData, cancel, action }) => {
    if (!isDirty(formData) && action.search === '?/update-user') {
      cancel();
    } else {
      disabled = true;
    }
    return async ({ update, result }) => {
      if (result.type === 'success') {
        if (result.data?.schedule) {
          usersData.addUserSched(result.data.schedule);
        } else if (result.data?.user) {
          usersData.updateUser(result.data.user, data?.defaultOptions?.leads ?? []);
        }
      } else {
        console.error(result);
      }
      await update({ invalidateAll: false, reset: false });
      disabled = false;
    };
  };

  const onFilter: SubmitFunction = ({ formData, cancel, action }) => {
    return async ({ update, result }) => {
      if (result.type === 'success') {
        console.log(result.data)
      } else {
        console.error(result);
      }
      await update({ invalidateAll: false, reset: false });
      disabled = false;
    };
  };

  const replaceQuery = (values: Record<string, string>) => {
    const url = new URL(window.location.toString());
    Object.entries(values).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    replaceState(url, $page.state);
  }
  onMount(() => {
    usersData.set(data.listOfUsers);
    window.addEventListener('keydown', closePopup);
    return () => {
      window.removeEventListener('keydown', () => {});
    };
  });

  $: hasFilter = Object.values($filterValues).filter((v) => v !== undefined && v !== '').length;
  $: selectedUser = $usersData.find((user) => user.id === itemId) || null;
  $: selectedUserSchedules = selectedUser?.schedules || [];
</script>

{#if userUpdate && selectedUser}
  {#key `${itemId}${show}`}
    <AsideContainer on:exit={() => (userUpdate = !userUpdate)}>
      {#if show == 'user'}
        <form action="?/update-user" method="POST" use:enhance={scheduleOnSubmit}>
          <UserInputs
            user={selectedUser}
            leads={data?.defaultOptions?.leads}
            regions={data?.defaultOptions?.regions}
            {disabled}
          />
        </form>
      {:else}
        <UserScheduleTable schedules={selectedUserSchedules} exclude={OMIT_SCHED_COLUMN} />
        <form action="?/add-schedule" method="POST" use:enhance={scheduleOnSubmit}>
          <ScheduleInputs schedule={selectedUserSchedules.at(0)} user_id={itemId} {disabled} />
        </form>
      {/if}
    </AsideContainer>
  {/key}
{/if}
<main class="container mt-4">
  <form action="?/filter" class="box" method="POST" use:enhance={onFilter}>
    <AdvanceFilter
      user={data?.user ? data.user : {}}
      regions={data?.defaultOptions?.regions}
      leads={data?.defaultOptions?.leads}
    />
  </form>

  <div class="box">
    <table class="table is-hoverable is-fullwidth is-striped" {...$tableAttrs}>
      <thead>
        {#each $headerRows as headerRow (headerRow.id)}
          <Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
            <tr {...rowAttrs}>
              <th>
                No.
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
              {#key row.original.updated_at}
                <tr
                  {...rowAttrs}
                  class:is-selected={itemId === row.original.id}
                  in:fly={{ delay: 100, duration: 200, easing: quintInOut, y: '-1rem' }}
                  out:fly={{ duration: 100, easing: sineOut, y: '1rem' }}
                >
                  <td>
                    <div class="buttons">
                      {#if data.user?.role == 'admin'}
                        <button
                          class="button is-small"
                          on:click={() => onUserUpdate(row.original, 'user')}
                          disabled={!row.original.region}
                          ><span title={`Edit ${row.original.name} Info`} class="icon is-small"
                            ><UserRoundPen /></span
                          ></button
                        >
                      {/if}
                      <button
                        class="button is-small"
                        on:click={() => onUserUpdate(row.original, 'sched')}
                        disabled={!row.original.region}
                        ><span title={`${row.original.name} Schedule`} class="icon is-small"
                          ><CalendarCog /></span
                        ></button
                      >
                    </div>
                  </td>
                  {#each row.cells as cell (cell.id)}
                    <Subscribe attrs={cell.attrs()} let:attrs>
                      {#if cell.isData()}
                        <td
                          {...attrs}
                          class={!row.original.active ? 'has-text-danger is-italic' : ''}
                        >
                          <Render
                            of={cell.value != null && cell.value != undefined ? cell.render() : '-'}
                          />
                        </td>
                      {/if}
                    </Subscribe>
                  {/each}
                </tr>
              {/key}
            {/if}
          </Subscribe>
        {/each}
      </tbody>
    </table>
  </div>
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
</style>
