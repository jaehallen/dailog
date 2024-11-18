<script lang="ts">
  import AsideContainer from '$lib/component/AsideContainer.svelte';
  import UserInputs from '$lib/component/UserInputs.svelte';
  import ScheduleInputs from '$lib/component/ScheduleInputs.svelte';
  import UserScheduleTable from '$lib/component/UserScheduleTable.svelte';
  import Switch from '$lib/component/Switch.svelte';
  import Toasts from '$lib/component/Toasts.svelte';
  import type { ScheduleRecord, UsersList } from '$lib/types/schema';
  import type { PageData } from './$types';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { enhance } from '$app/forms';
  import { fly } from 'svelte/transition';
  import { quintInOut, sineOut } from 'svelte/easing';
  import { onDestroy, onMount, tick } from 'svelte';
  import { AdvanceFilter } from '$lib/component/Datatable';
  import { Subscribe, Render } from 'svelte-headless-table';
  import { getUsersTable, usersData } from '$lib/table-users';
  import { validateSearch, validateUser, type SearchOptions } from '$lib/validation';
  import { replaceState } from '$app/navigation';
  import { page } from '$app/stores';
  import { toasts } from '$lib/data-store';
  import { getContextUpdate, setContextUpdate } from '$lib/context';
  import UserBatchInputs from '$lib/component/UserBatchInputs.svelte';
  import { isEditor } from '$lib/permission';
  import { CalendarCog, UserRoundPen } from 'lucide-svelte';
  import ButtonIcon from '$lib/component/ButtonIcon.svelte';

  export let data: PageData;
  setContextUpdate();
  const { editUser, isBatchUpdate } = getContextUpdate();
  let disabled = false;
  let loading = false;
  let filterOpt: SearchOptions = data?.queries || {};
  $: selectedUser = $usersData.find((user) => user.id == $editUser.selectedId) ?? null;
  $: userSchedules = selectedUser?.schedules ?? [];

  const OMIT_SCHED_COLUMN: (keyof ScheduleRecord)[] = [
    'id',
    'clock_dur_min',
    'break_dur_min',
    'lunch_dur_min'
  ];

  const { headerRows, rows, tableAttrs, tableBodyAttrs, pluginStates } = getUsersTable(
    usersData,
    data?.user
  );
  const { filterValues } = pluginStates.filter;
  const { selectedDataIds } = pluginStates.select;

  const maxId = (data: UsersList[] = []) => {
    return data.length ? Math.max(...data.map((x) => x.id)) : 0;
  };

  const fieldsToUpdate = (formData: FormData) => {
    const data = Object.fromEntries(formData);
    const valid = validateUser.safeParse(data);
    const fields: (keyof UsersList)[] = ['id'];
    if (valid.success && selectedUser) {
      Object.entries(valid.data).forEach(([key, value]) => {
        if (selectedUser[key] !== value) {
          fields.push(key);
        }
      });
    }

    return fields;
  };

  const isDirtyFilterInput = (formData: FormData) => {
    const data = Object.fromEntries(formData);
    const validInput = validateSearch.safeParse(data);
    return (
      validInput.success &&
      Object.entries(validInput.data).some(([key, val]) => filterOpt[key] !== val)
    );
  };

  const indexPageList = (data: UsersList[], q: SearchOptions) => {
    const pages = typeof q.page_index == 'string' ? q.page_index.split('_') : [];
    const lastIdStr = String(q.last_id);

    if (!pages.includes(lastIdStr)) {
      pages.push(lastIdStr);
      q.page_index = pages.join('_');
    }

    if (q.limit > data.length) {
      q.page_total = pages.length;
    }

    return q;
  };

  const initDatatable = (data: UsersList[], queries: SearchOptions) => {
    filterOpt = { ...queries };
    filterOpt = indexPageList(data, { ...filterOpt });
    usersData.set(data);
    updateQuery(filterOpt);
  };

  const onDataUpdate: SubmitFunction = ({ formData, cancel, action }) => {
    if (action.search === '?/update-user') {
      const fields = fieldsToUpdate(formData);
      if (fields.length < 2) {
        cancel();
        return;
      }
      formData.set('fields', fields.join('|'));
    }
    disabled = true;

    return async ({ update, result }) => {
      if (result.type === 'success') {
        if (result.data?.schedule) {
          usersData.addUserSched(result.data.schedule);
          toasts.add({ message: 'Schedule updated successfully' });
        } else if (result.data?.user) {
          usersData.updateUser(result.data.user, data?.defaultOptions?.leads ?? []);
          toasts.add({ message: 'User updated successfully' });
        } else if (result.data?.listOfSchedules) {
          usersData.batchSched(result.data.listOfSchedules);
          toasts.add({ message: 'Users schedules updated successfully' });
        } else if (result.data?.listOfUsers) {
          usersData.batchUpdateUser(result.data.listOfUsers, data?.defaultOptions?.leads ?? []);
          toasts.add({ message: 'Multiple users updated successfully' });
          update({ invalidateAll: true, reset: true });
        } else {
          toasts.add({ message: 'Success' });
        }
      } else {
        toasts.add({ message: 'Something went wrong', type: 'error', timeout: 0 });
        console.error(result);
      }
      await update({ invalidateAll: true, reset: false });
      disabled = false;
    };
  };

  const onFilter: SubmitFunction = ({ formData, action, cancel }) => {
    loading = true;
    if (!isDirtyFilterInput(formData) && action.search === '?/filter') {
      cancel();
      loading = false;
    } else if (action.search == '?/next-page') {
      formData.set('last_id', encodeURIComponent(maxId($usersData)));
    } else if (action.search == '?/prev-page') {
      const pages = filterOpt.page_index?.split('_') || [];
      if (pages.length) {
        const page = pages.indexOf(String(filterOpt.last_id));
        const lastId = pages[page - 1];
        if (lastId) {
          formData.set('last_id', encodeURIComponent(lastId));
        }
      } else {
        cancel();
      }
    }

    return async ({ update, result }) => {
      if (result.type === 'success') {
        if (result.data) {
          const { listOfUsers, queries: q = {} } = result.data;
          filterOpt = { ...q };

          if (listOfUsers) {
            if (action.search === '?/filter') {
              $filterValues = {};

              if (q.search && q.search.length) {
                usersData.set(listOfUsers);
              } else {
                initDatatable(listOfUsers, q);
              }
            } else {
              if (listOfUsers.length) {
                filterOpt = indexPageList(listOfUsers, q);
                usersData.set(listOfUsers);
              } else {
                filterOpt.page_total = (filterOpt.page_index?.split('_') ?? []).length;
              }
            }
          }
          updateQuery(filterOpt);
        }
      } else {
        console.error(result);
      }
      await update({ invalidateAll: false, reset: false });
      loading = false;
    };
  };

  const updateQuery = async (values: SearchOptions) => {
    Object.entries(values).forEach(([key, value]) => {
      $page.url.searchParams.set(key, String(value || ''));
    });
    replaceState($page.url, $page.state);
  };

  onMount(async () => {
    await tick();
    if (data.error) {
      console.error(data.error);
      toasts.add({ message: data.error?.message, type: 'error', timeout: 0 });
    }
    initDatatable(data.listOfUsers, data.queries);
    window.addEventListener('keydown', (e) => {
      if (e.key == 'Escape') {
        editUser.reset();
      }
    });
  });

  onDestroy(() => {
    window.removeEventListener('keydown', () => {});
  });

  $: if ($isBatchUpdate) {
    $editUser.showType = 'manysched';
  } else {
    editUser.reset();
  }
</script>

{#if $editUser.isEdit}
  {#key $editUser.updateId}
    <AsideContainer on:exit={() => editUser.reset()}>
      {#if $editUser.showType == 'user' && selectedUser}
        <form action="?/update-user" method="POST" use:enhance={onDataUpdate}>
          <UserInputs
            user={selectedUser}
            leads={data?.defaultOptions?.leads}
            regions={data?.defaultOptions?.regions}
            editor={data?.user ?? {}}
            {disabled}
          />
        </form>
      {:else if $editUser.showType == 'sched'}
        <UserScheduleTable schedules={userSchedules} exclude={OMIT_SCHED_COLUMN} />
        <form action="?/add-schedule" method="POST" use:enhance={onDataUpdate}>
          <ScheduleInputs
            schedule={userSchedules.at(0)}
            user_id={$editUser.selectedId}
            {disabled}
          />
        </form>
      {:else if $editUser.showType == 'manysched'}
        <form action="?/add-many-schedule" method="POST" use:enhance={onDataUpdate}>
          <input type="hidden" name="ids_list" value={Object.keys($selectedDataIds).join('_')} />
          <ScheduleInputs schedule={userSchedules.at(0)} user_id={0} {disabled} cols={2} />
        </form>
      {:else if $editUser.showType == 'manyuser'}
        <form action="?/update-many-user" method="POST" use:enhance={onDataUpdate}>
          <UserBatchInputs
            leads={data?.defaultOptions?.leads}
            regions={data?.defaultOptions?.regions}
            selectedIds={$selectedDataIds}
          />
        </form>
      {/if}
    </AsideContainer>
  {/key}
{/if}

<Toasts />
<main class="container mt-6" class:is-skeleton={loading}>
  <div class="columns mb-0">
    <div class="column is-3 is-flex is-align-items-center">
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <Switch bind:checked={$isBatchUpdate} label="Batch Update" />
          </div>
          {#if $isBatchUpdate}
            <div class="buttons" in:fly={{ delay: 200, duration: 200, y: '1rem' }}>
              {#if isEditor(data.user?.role)}
                <ButtonIcon small on:click={() => editUser.edit('manyuser')}>
                  <UserRoundPen />
                </ButtonIcon>
              {/if}
              <ButtonIcon small on:click={() => editUser.edit('manysched')}>
                <CalendarCog />
              </ButtonIcon>
            </div>
          {/if}
        </div>
      </div>
    </div>
    <div class="column">
      <form action="?/filter" class="block" method="POST" use:enhance={onFilter}>
        <AdvanceFilter
          queries={filterOpt ?? {}}
          user={data?.user ?? {}}
          regions={data?.defaultOptions?.regions}
          leads={data?.defaultOptions?.leads}
          disabled={loading}
        />
      </form>
    </div>
  </div>
  <div class="box">
    <table
      class="table is-hoverable is-fullwidth is-striped"
      class:is-skeleton={loading}
      {...$tableAttrs}
    >
      <thead>
        {#each $headerRows as headerRow (headerRow.id)}
          <Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
            <tr {...rowAttrs}>
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
          <Subscribe rowAttrs={row.attrs()} rowProps={row.props()} let:rowAttrs let:rowProps>
            {#key row.isData() && row.original.updated_at}
              <tr
                {...rowAttrs}
                class:is-selected={rowProps.select.selected}
                in:fly={{ delay: 100, duration: 200, easing: quintInOut, y: '-1rem' }}
                out:fly={{ duration: 100, easing: sineOut, y: '1rem' }}
              >
                {#each row.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs>
                    <td
                      {...attrs}
                      class={row.isData() && !row.original.active
                        ? 'has-text-danger is-italic'
                        : ''}
                    >
                      {#if cell.isData()}
                        <Render
                          of={cell.value == undefined || cell.value == null ? '-' : cell.render()}
                        />
                      {:else}
                        <Render of={cell.render() || '-'} />
                      {/if}
                    </td>
                  </Subscribe>
                {/each}
              </tr>
            {/key}
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
