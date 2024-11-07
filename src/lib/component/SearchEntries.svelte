<script lang="ts">
  import ButtonIcon from '$lib/component/ButtonIcon.svelte';
  import { DateInput } from 'date-picker-svelte';
  import { UserRoundSearch } from 'lucide-svelte/icons';

  let now = new Date();

  export let regions: string[] = [];
  export let queries: {
    search: string;
    date_at: string;
    region: string;
  } = {
    search: '',
    date_at: now.toISOString().substring(0, 10),
    region: ''
  };

  let date = new Date(queries.date_at);
  const datePicker = {
    min: new Date(now.setDate(now.getDate() - 35)),
    max: new Date(),
    timePrecision: null,
    id: 'entrydate',
    format: 'yyyy-MM-dd',
    locale: {
      weekStartsOn: 0
    }
  };

  const WEEKS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const atDay = new Date(queries.date_at).getDay();
</script>

<div class="level px-2">
  <div class="level-left">
    <div class="level-item">
      <div class="control">
        <ButtonIcon small round display="is-light is-link">
          <UserRoundSearch />
        </ButtonIcon>
      </div>
    </div>
    <div class="level-item">
      <div class="contro">
        <input type="hidden" value={date.toISOString().substring(0, 10)} name="date_at" readonly />
        <input
          name="search"
          type="text"
          class="input is-small is-rounded"
          placeholder="Search User..."
        />
      </div>
    </div>
    <div class="level-item">
      <div class="select is-small is-rounded">
        <select name="region" id="region">
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
        <DateInput bind:value={date} {...datePicker} />
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
              class:is-link={i == atDay}
              ><strong class="is-capitalized" class:has-text-danger={day == 'sun'}>{day}</strong
              ></button
            >
          </p>
        {/each}
      </div>
    </div>
  </div>
</div>
