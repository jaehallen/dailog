<script lang="ts">
  import { slide } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { Pagination, FilterDropdown, SearchUser } from '$lib/component/Datatable';
  import { FilterX, UserRoundPen, CalendarCog } from 'lucide-svelte/icons';
  import { browser } from '$app/environment';
  import { Subscribe, Render } from 'svelte-headless-table';
  import { readable } from 'svelte/store';
  import type { PageData } from './$types';
  import { getUsersTable } from '$lib/table-users';
  import AsideContainer from '$lib/component/AsideContainer.svelte';
  import UserInputs from '$lib/component/UserInputs.svelte';
  import type { UserRecord, UsersList } from '$lib/types/schema';

  export let data: PageData;
  let advanceFilter = true;
  let userUpdate = false;
  let itemId = 0;
  let userData: Omit<UsersList, 'teamlead' | 'latest_schedule' | 'schedules'> = {
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

  const onUserUpdate = (itemData: UsersList) => {
    userUpdate = true;
    itemId = itemData.id;
    userData = { ...itemData };
  };

  onMount(() => {
    window.addEventListener('keydown', closePopup);
    return () => {
      window.removeEventListener('keydown', () => {});
    };
  });
</script>

{#if browser}
  {#if userUpdate}
    <AsideContainer on:exit={() => (userUpdate = !userUpdate)}>
      <form action="">
        {#key itemId}
          <UserInputs {...userData}/>
        {/key}
      </form>
    </AsideContainer>
  {/if}
  <main class="container">
    <div class="grid mb-1">
      <button class="button" on:click={() => (userUpdate = !userUpdate)}>User Upadate</button>
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
      <thead class="block">
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
            <tr {...rowAttrs}>
              {#if row.isData()}
                <td>
                  <div class="buttons">
                    <button class="button is-small" on:click={() => onUserUpdate(row.original)}
                      ><span title={`Edit ${row.original.name} Info`} class="icon is-small"
                        ><UserRoundPen /></span
                      ></button
                    >
                    <button class="button is-small"
                      ><span title={`${row.original.name} Schedule`} class="icon is-small"
                        ><CalendarCog /></span
                      ></button
                    >
                  </div>
                </td>
              {/if}
              {#each row.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs>
                  <td {...attrs} class:has-text-danger={row.isData() && row.original.lock_password}>
                    <Render
                      of={cell.isData() && cell.value != null && cell.value != undefined
                        ? cell.render()
                        : '-'}
                    />
                  </td>
                </Subscribe>
              {/each}
            </tr>
          </Subscribe>
        {/each}
      </tbody>
    </table>
  </main>
{/if}

<style>
  table {
    border-collapse: separate;
  }

  thead {
    position: sticky;
    inset-block-start: 0;
    background: var(--bulma-scheme-main);
    z-index: 1;
  }

  .filter-panel {
    width: 300px;
  }
</style>
