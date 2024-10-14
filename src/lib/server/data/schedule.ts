import type { ScheduleRecord, TimeEntryRecord } from '$lib/types/schema';
import { DEFAULT_GRACE_HOUR, DEFAULT_MIN_WORKDATE } from '$lib/defaults';
import { db } from '$lib/server/database/db-controller';
import { env } from '$env/dynamic/private';
import { dateAtOffsetStr } from '$lib/utility';

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

function getFloatHour(offset: number, time?: string) {
  let d = time ? new Date(`2000-01-01T${time}Z`) : new Date()
  d.setHours(d.getHours() + offset);
  return d.getHours() + d.getMinutes() / 60;
}

function withinGraceHour(latestSchedule: ScheduleRecord, workDur: number): boolean {
  const halfWorkhour = Math.round(workDur / 120);
  const graceHour = parseInt(env.GRACE_HOUR) || DEFAULT_GRACE_HOUR;
  const currentHour = getFloatHour(latestSchedule.local_offset);
  const minHour = getFloatHour((-1 * graceHour), latestSchedule.clock_at);
  const maxHour = getFloatHour(halfWorkhour, latestSchedule.clock_at);
  
  if (maxHour > minHour) {
    return currentHour >= minHour && currentHour <= maxHour;
  }

  return currentHour >= minHour || currentHour <= maxHour;
}

export function isStartOfDuty(
  clockEntry: TimeEntryRecord,
  entrySchedule: ScheduleRecord,
  latestSchedule: ScheduleRecord
): boolean {
  const today = new Date();
  const clockStart = new Date((clockEntry.start_at + entrySchedule.utc_offset * 3600) * 1000);
  today.setHours(today.getHours() + entrySchedule.utc_offset);

  const minDiff = (today.getTime() - clockStart.getTime()) / 60000; //diff in minute
  const workDur =
    latestSchedule.clock_dur_min ??
    ((parseInt(env.MIN_WORKDATE_DIFF) || DEFAULT_MIN_WORKDATE) * 60) / 2; //work duration in minute

  if (
    today.getDate() !== clockStart.getDate() &&
    minDiff >= workDur &&
    withinGraceHour(latestSchedule, workDur)
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
