<script lang="ts">
  import type { ScheduleRecord } from '$lib/types/schema';
  import { scheduleColumn } from '$lib/table-schema';
  export let schedules: ScheduleRecord[];
  export let exclude: (keyof ScheduleRecord)[] = [];

  const column = scheduleColumn.filter((sched) => !exclude.includes(sched.key));

  const sortSchedule = (a: ScheduleRecord, b: ScheduleRecord) => {
    return new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime();
  };
</script>

<div class="content">
  <table class="table is-fullwidth is-striped is-hoverable">
    <thead>
      <tr>
        {#each column as column, cid (cid)}
          <th class="has-text-right"> {column.title} </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#if schedules.length}
        {#each schedules.toSorted(sortSchedule) as sched (sched.id)}
          <tr>
            {#each column as column, cid (cid)}
              <td class="has-text-right">
                {@html column.render(sched[column.key] || '-')}
              </td>
            {/each}
          </tr>
        {/each}
      {:else}
        <tr>
          {#each column as _, cid (cid)}
            <td>-</td>
          {/each}
        </tr>
      {/if}
    </tbody>
  </table>
</div>
