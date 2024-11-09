<script lang="ts">
  import ButtonIcon from '$lib/component/ButtonIcon.svelte';
  import { DateInput } from 'date-picker-svelte';
  import { Search } from 'lucide-svelte/icons';
  import { createEventDispatcher } from 'svelte';

  export let regions: string[] = [];
  export let disabled = false;
  export let date: Date;
  export let queries: {
    search: string;
    date_at: string;
    region: string;
  };

  let now = new Date();
  const dispatch = createEventDispatcher();
  const WEEKS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const datePicker = {
    min: new Date(now.setDate(now.getDate() - 35)),
    max: new Date(),
    timePrecision: null,
    id: 'entrydate',
    format: 'MMM dd, yyyy',
    closeOnSelection: true,
    locale: {
      weekStartsOn: 0
    }
  };

  const onChange = () => {
    console.log('test');
    dispatch('search');
  };
</script>

<div class="level px-2">
  <div class="level-left">
    <div class="level-item">
      <div class="control">
        <ButtonIcon small round display="is-light is-link" {disabled}>
          <Search />
        </ButtonIcon>
      </div>
    </div>
    <div class="level-item">
      <div class="control">
        <input
          name="search"
          type="text"
          class="input is-small is-rounded"
          value={queries.search ?? ''}
          autocomplete="off"
          placeholder="Search User..."
          {disabled}
        />
      </div>
    </div>
    <div class="level-item">
      <div class="select is-small is-rounded">
        <select name="region" id="region" on:change={onChange} {disabled}>
          {#if regions.length > 1}
            <option value="">All</option>
          {/if}
          {#each regions as region, id (id)}
            <option value={region}>{region}</option>
          {/each}
        </select>
      </div>
    </div>
    <div class="level-item">
      <div class="control">
        <input type="hidden" value={date.toISOString().substring(0, 10)} name="date_at" readonly />
        <DateInput bind:value={date} {...datePicker} on:select={onChange} {disabled} />
      </div>
    </div>
  </div>
  <div class="level-right">
    <div class="level-item">
      <div class="field has-addons">
        {#each WEEKS as day, i (i)}
          <p class="control">
            <button
              formaction={`?/search&day=${i}`}
              class="button is-small is-rounded"
              class:is-dark={i == date.getDay()}
              {disabled}
              ><strong class="is-capitalized" class:has-text-danger={day == 'sun'}>{day}</strong
              ></button
            >
          </p>
        {/each}
      </div>
    </div>
  </div>
</div>
