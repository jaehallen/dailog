import type { OptActionState, TimeEntryRecord, UserInfo, UserSchedule } from '$lib/types/schema';
import type { Session } from 'lucia';
import { db } from '$lib/server/database/db-controller';
import { getSchedule } from './schedule';
import { getWeekRange } from '$lib/utility';

interface UserLatestTimedata {
  schedule: UserSchedule;
  timeEntries: TimeEntryRecord[];
}

export const postTime = async (
  data: Omit<TimeEntryRecord, 'start_at' | 'end_at' | 'elapse_sec' | 'total_sec'> & {
    timestamp: number;
    timeAction: OptActionState;
  }
) => {
  if (data.timeAction == 'start') {
    return await db.startTime({
      user_id: data.user_id,
      category: data.category,
      date_at: data.date_at,
      sched_id: data.sched_id,
      start_at: data.timestamp,
      user_ip: data.user_ip,
      user_agent: data.user_agent,
      remarks: data.remarks
    });
  } else {
    return await db.endTime({
      id: data.id,
      end_at: data.timestamp,
      user_ip: data.user_ip,
      user_agent: data.user_agent,
      remarks: data.remarks
    });
  }
};

export const userCurrentEntries = async (session: Session): Promise<UserLatestTimedata | null> => {
  const { schedules, timeEntries } = await db.getUserEntryAndSched(session.userId);
  const schedule = getSchedule(schedules, timeEntries);
  return {
    timeEntries,
    schedule
  };
};

export const userReports = async (
  userId: number,
  date: string
): Promise<Omit<UserInfo, 'user'>> => {
  return await db.getTimEntries(userId, getWeekRange(date));
};
