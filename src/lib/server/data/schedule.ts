import type { ScheduleRecord, TimeEntryRecord } from '$lib/types/schema';
import { DEFAULT_GRACE_HOUR, DEFAULT_MIN_WORKDATE } from '$lib/defaults';
import { db } from '$lib/server/database/db-controller';
import { env } from '$env/dynamic/private';
import { dateAtOffsetStr, timeDiffSec } from '$lib/utility';

export const getUserSchedule = async (
  userId: number
): Promise<({ startOfDuty: boolean; date_at: string } & ScheduleRecord) | null> => {
  const { schedules, timeEntries } = await db.getUserEntryAndSched(userId, true, 10);

  if (!schedules.length) {
    return null;
  }

  return getSchedule(schedules, timeEntries);
};

export function getSchedule(schedules: ScheduleRecord[], timeEntries: TimeEntryRecord[]) {
  const clockEntry = timeEntries.find((entry) => entry.category === 'clock');
  const latestSchedule = getCurrentSchedule(schedules);
  const date_at = dateAtOffsetStr(new Date(), latestSchedule.utc_offset);

  if (!clockEntry) {
    return {
      startOfDuty: true,
      date_at,
      ...latestSchedule
    };
  }

  const entrySchedule = scheduleByEntry(schedules, clockEntry) ?? latestSchedule;
  const startOfDuty = isStartOfDuty(clockEntry, entrySchedule, latestSchedule);

  if (!startOfDuty && clockEntry) {
    return {
      startOfDuty,
      date_at: clockEntry?.date_at,
      ...entrySchedule
    };
  }

  return {
    startOfDuty,
    date_at,
    ...latestSchedule
  };
}

function getLocalTime(local_offset: number) {
  const d = new Date();
  d.setHours(d.getHours() + local_offset);
  const [hh, mm] = d.toISOString().split('T')[1].split(':');

  return `${hh}:${mm}`;
}

function withinGraceHour(latestSchedule: ScheduleRecord, workDur: number): boolean {
  const localTime = getLocalTime(latestSchedule.local_offset);
  const graceHour = parseInt(env.GRACE_HOUR) || DEFAULT_GRACE_HOUR;
  const currentHour = new Date(`2000-01-01T${localTime}Z`);
  const halfWorkhour = Math.round(workDur / 120);
  const minHour = new Date(`2000-01-01T${latestSchedule.clock_at}Z`);
  const maxHour = new Date(`2000-01-01T${latestSchedule.clock_at}Z`);
  minHour.setHours(minHour.getHours() - graceHour);
  maxHour.setHours(maxHour.getHours() + halfWorkhour);

  return false;
}

export function isStartOfDuty(
  clockEntry: TimeEntryRecord,
  entrySchedule: ScheduleRecord,
  latestSchedule: ScheduleRecord
): boolean {
  const today = new Date();
  const clockStart = new Date((clockEntry.start_at + entrySchedule.utc_offset * 3600) * 1000);
  const localTime = getLocalTime(latestSchedule.local_offset);
  const timeDiffHour = timeDiffSec(localTime, latestSchedule.clock_at) / 3600;
  const graceHour = parseInt(env.GRACE_HOUR) || DEFAULT_GRACE_HOUR;
  today.setHours(today.getHours() + entrySchedule.utc_offset);

  const minDiff = (today.getTime() - clockStart.getTime()) / 60000; //minute diff
  const workDur =
    latestSchedule.clock_dur_min ??
    ((parseInt(env.MIN_WORKDATE_DIFF) || DEFAULT_MIN_WORKDATE) * 60) / 2; //work duration in minute

  console.log(localTime, latestSchedule.clock_at);

  //negative: after schduled time based on total working hours
  if (
    today.getDate() !== clockStart.getDate() &&
    minDiff >= workDur &&
    timeDiffHour >= workDur / -120 &&
    timeDiffHour <= graceHour
  )
    return true;

  return false;
}

export function getCurrentSchedule(schedules: ScheduleRecord[] = []): ScheduleRecord {
  schedules.sort(
    (a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
  );

  return schedules[0] ?? null;
}

export function scheduleByEntry(schedules: ScheduleRecord[], clockEntry: TimeEntryRecord) {
  const sched = schedules.find((sched) => sched.id === clockEntry.sched_id);
  return sched ?? null;
}
