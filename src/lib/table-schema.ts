import type { ScheduleRecord, TimeEntryRecord, TimeEntryReport } from '$lib/types/schema';
import { formatDateOrTime, getOffsetTimezoneStr, minToDuration, secToDuration } from '$lib/utility';

interface TableColumns<T> {
  title: string;
  key: keyof T;
  render: (
    val: string | number | boolean | undefined | null,
    entry?: { local_offset: number } & Partial<T>
  ) => string | number;
}

export const timesheetColumn: TableColumns<TimeEntryRecord>[] = [
  {
    title: 'Date',
    key: 'date_at',
    render: (val) => {
      return formatDateOrTime(val as string);
    }
  },
  {
    title: 'Schedule ID',
    key: 'sched_id',
    render: (val) => {
      return val as number;
    }
  },
  {
    title: 'Type',
    key: 'category',
    render: (val) => {
      return `<span class="is-capitalized">${String(val)}</span>`;
    }
  },
  {
    title: 'Start At',
    key: 'start_at',
    render: (val, entry) => {
      return formatDateOrTime(new Date(Number(val) * 1000), true, entry?.local_offset || 8);
    }
  },
  {
    title: 'End At',
    key: 'end_at',
    render: (val, entry) => {
      const sec = Number(val);
      return !sec ? '-' : formatDateOrTime(new Date(Number(sec) * 1000), true, entry?.local_offset);
    }
  },
  {
    title: 'Duration',
    key: 'total_sec',
    render(val) {
      const total_sec = Number(val);
      return !total_sec ? '-' : secToDuration(total_sec);
    }
  },
  {
    title: 'Remarks',
    key: 'remarks',
    render(val) {
      return `<span class="is-size-7 is-italic">${val || '-'}</span>`;
    }
  }
];

export const scheduleColumn: TableColumns<ScheduleRecord>[] = [
  {
    title: 'Schedule ID',
    key: 'id',
    render: (val) => {
      if (!val) return '-';

      return val as number;
    }
  },
  {
    title: 'Effective Date',
    key: 'effective_date',
    render: (val) => {
      return formatDateOrTime(val as string);
    }
  },
  {
    title: 'Client Timezone',
    key: 'utc_offset',
    render: (val) => {
      return getOffsetTimezoneStr(val as number);
    }
  },
  {
    title: 'Clock In',
    key: 'clock_at',
    render: (val) => {
      return formatDateOrTime(val as string);
    }
  },
  {
    title: 'First Break',
    key: 'first_break_at',
    render: (val) => {
      return formatDateOrTime(val as string);
    }
  },
  {
    title: 'Lunch Break',
    key: 'lunch_at',
    render: (val) => {
      return formatDateOrTime(val as string);
    }
  },
  {
    title: 'Second Break',
    key: 'second_break_at',
    render: (val) => {
      return formatDateOrTime(val as string);
    }
  },
  {
    title: 'Work Duration',
    key: 'clock_dur_min',
    render: (val) => {
      return minToDuration(val as number);
    }
  },
  {
    title: 'Break Duration',
    key: 'break_dur_min',
    render: (val) => {
      return minToDuration(val as number);
    }
  },
  {
    title: 'Lunch Duration',
    key: 'lunch_dur_min',
    render: (val) => {
      return minToDuration(val as number);
    }
  },
  {
    title: 'Day Off',
    key: 'day_off',
    render: (val) => {
      let days = String(val).split(',');
      if (days.length) {
        return days
          .map((day) => {
            return `<strong class="is-capitalized">${String(day)}</strong>`;
          })
          .join('<strong>, </strong>');
      }

      return '-';
    }
  }
];

export const reportColumn: TableColumns<TimeEntryReport>[] = [
  {
    title: 'Date',
    key: 'date_at',
    render: (val) => {
      return formatDateOrTime(val as string);
    }
  },
  {
    title: 'Type',
    key: 'category',
    render: (val) => {
      return `<span class="is-capitalized">${String(val)}</span>`;
    }
  },
  {
    title: 'Clock In',
    key: 'clock_at',
    render(val, entry) {
      if (entry?.category === 'clock') {
        return formatDateOrTime(val as string);
      }

      return '-';
    }
  },
  {
    title: 'Start At',
    key: 'start_at',
    render: (val, entry) => {
      return formatDateOrTime(new Date(Number(val) * 1000), true, entry?.local_offset || 8);
    }
  },
  {
    title: 'End At',
    key: 'end_at',
    render: (val, entry) => {
      const sec = Number(val);
      return !sec ? '-' : formatDateOrTime(new Date(Number(sec) * 1000), true, entry?.local_offset);
    }
  },
  {
    title: 'Duration',
    key: 'total_sec',
    render(val) {
      const total_sec = Number(val);
      return !total_sec ? '-' : secToDuration(total_sec);
    }
  },
  {
    title: 'Remarks',
    key: 'remarks',
    render(val) {
      return `<span class="is-size-7 is-italic">${val || '-'}</span>`;
    }
  },
  {
    title: 'Schedule ID',
    key: 'sched_id',
    render: (val) => {
      return val as number;
    }
  },
  {
    title: 'Effective Date',
    key: 'effective_date',
    render: (val) => {
      return formatDateOrTime(val as string);
    }
  }
];
