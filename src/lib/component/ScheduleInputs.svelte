<script lang="ts">
  import type { ScheduleRecord } from '$lib/types/schema';
  import Field from '$lib/component/Field.svelte';
  import DropdownButton from '$lib/component/DropdownButton.svelte';
  import { WEEKDAYS, UTCOFFSET } from '$lib/defaults';
  export let schedule: ScheduleRecord | null = null;
  export let user_id: number;
  export let disabled = false;
  export let cols = 4;
  const DAYS = [...WEEKDAYS.slice(1), WEEKDAYS[0]];
  const SHORTDAYS = DAYS.map((day) => day.toLowerCase().substring(0, 3));
  const UTCMAP = new Map(UTCOFFSET);
  const TODAY = new Date().toISOString().split('T')[0];
  let effectiveDate = TODAY;
  let daysValue = SHORTDAYS.map((day) => Boolean(schedule?.day_off?.includes(day)));
  let clientUTC = String(
    UTCOFFSET.find((offset) => Number(offset[1]) === Number(schedule?.utc_offset))?.at(0) || ''
  );
  let localUTC = String(
    UTCOFFSET.find((offset) => Number(offset[1]) === (Number(schedule?.local_offset) || 8))?.at(
      0
    ) || ''
  );

  $: dayOff = daysValue
    .map((day, i) => (day ? SHORTDAYS[i] : null))
    .filter(Boolean)
    .join(',');
  $: utcOffset = UTCMAP.get(clientUTC);
  $: localOffset = UTCMAP.get(localUTC);
  $: isValidDate = new Date(effectiveDate).getTime() >= new Date(TODAY).getTime();
</script>

<fieldset class="box">
  <legend class="label">Add Schedule</legend>
  <div class="is-hidden">
    <input
      class="input"
      type="alphanumeric"
      pattern="^[0-9]{'{'}6{'}'}$"
      placeholder="123456"
      name="user_id"
      value={user_id || 999999}
      required
      readonly
    />
    <input
      type="number"
      class="input"
      name="utc_offset"
      min="-12"
      max="14"
      value={utcOffset}
      readonly
      required
    />
    <input
      type="number"
      class="input"
      name="local_offset"
      min="-12"
      max="14"
      value={localOffset}
      required
      readonly
    />
  </div>
  <div class={`fixed-grid has-${cols}-cols`}>
    <div class="grid">
      <Field>
        <input
          type="date"
          class="input"
          name="effective_date"
          bind:value={effectiveDate}
          required
          min={TODAY}
        />
        {#if isValidDate}
          <strong class="help">Effective Date</strong>
        {:else}
          <strong class="help is-danger">Previous Date Not Allowed!</strong>
        {/if}
      </Field>
      <div class="field">
        <div class="field-body">
          <div class="field has-addons has-addons-right">
            <div class="control">
              <DropdownButton label="Day">
                <p class="dropdown-item">
                  {#each DAYS as day, i (i)}
                    <p>
                      <label class="label">
                        <input type="checkbox" bind:checked={daysValue[i]} />
                        {day}
                      </label>
                    </p>
                  {/each}
                </p>
              </DropdownButton>
            </div>
            <p class="control">
              <input type="text" class="input" name="day_off" required readonly value={dayOff} />
            </p>
          </div>
        </div>
        <strong class="help">Day Off</strong>
      </div>
      <Field>
        <div class="select is-fullwidth">
          <select required bind:value={clientUTC}>
            <option value=""></option>
            {#each UTCMAP as [key]}
              <option>{key}</option>
            {/each}
          </select>
        </div>
        <strong class="help">Client Timezone (UTC Offset)</strong>
      </Field>
      <Field>
        <div class="select is-fullwidth">
          <select required bind:value={localUTC} disabled>
            <option value=""></option>
            {#each UTCMAP as [key]}
              <option>{key}</option>
            {/each}
          </select>
        </div>
        <strong class="help">Philippine Timezone</strong>
      </Field>
      <Field>
        <input
          type="time"
          class="input"
          name="clock_at"
          required
          value={schedule?.clock_at || ''}
        />
        <strong class="help">Clock In</strong>
      </Field>
      <Field>
        <input
          type="time"
          class="input"
          name="first_break_at"
          required
          value={schedule?.first_break_at || ''}
        />
        <strong class="help">First Break</strong>
      </Field>
      <Field>
        <input
          type="time"
          class="input"
          name="lunch_at"
          required
          value={schedule?.lunch_at || ''}
        />
        <strong class="help">Lunch Break</strong>
      </Field>
      <Field>
        <input
          type="time"
          class="input"
          name="second_break_at"
          required
          value={schedule?.second_break_at || ''}
        />
        <strong class="help">Second Break</strong>
      </Field>
    </div>
  </div>
  <div class="field is-grouped is-grouped-right">
    <div class="control">
      <button class="button is-primary" {disabled}>Add Schedule</button>
    </div>
  </div>
</fieldset>
