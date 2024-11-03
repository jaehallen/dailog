// export const BREAKTYPE: Record<string, OptCategory> = {};

import type { ACTIONSTATE, CATEGORY, USERROLE, WEEKDAYS } from '$lib/defaults';

export type OptRole = (typeof USERROLE)[number];
export type OptCategory = (typeof CATEGORY)[number];
export type OptActionState = (typeof ACTIONSTATE)[number];
export type OptWeekdays = (typeof WEEKDAYS)[number];
export type DbResponse<T> = { data: T; error?: never } | { data: null; error: { message: string } };
export interface ZPostTime {
  id: number;
  category: OptCategory;
  timeAction: OptActionState;
  date_at: string;
  sched_id: number;
  remarks: string | null;
}

export interface TimesheetPostInfo {
  date_at: string;
  id: number | null;
  category: OptCategory;
  timeAction: OptActionState;
}

export interface TimesheetStateInfo {
  confirm: boolean;
  state: OptActionState;
  nextState: OptActionState;
  category: OptCategory;
  date_at: string;
  isBreak: boolean;
  id: number;
  timestamp: number;
  lunched: boolean;
  message: string;
  local_offset: number;
  sched_id: number;
}

export interface UserRecord {
  id: number;
  active: boolean;
  name: string;
  region: string;
  role: OptRole;
  lead_id: number;
  password_hash: string;
  lock_password: boolean;
  created_at?: string;
  updated_at?: string;
  preferences: {
    avatar_src: URL;
    background_src: URL;
  } | null;
}

export interface UserProfile extends UserRecord {
  teamlead: string;
}

export interface UsersList extends Omit<UserRecord, 'password_hash' | 'preferences'> {
  teamlead: string;
  latest_schedule: string;
  schedules: ScheduleRecord[];
  [key: string]: string | number | boolean | ScheduleRecord[] | null | undefined;
}

export interface SessionRecord {
  id: string;
  user_id: number;
  expires_at: number;
}

export interface ScheduleRecord {
  id: number;
  user_id: number;
  effective_date: string;
  utc_offset: number;
  local_offset: number;
  clock_dur_min?: number;
  lunch_dur_min?: number;
  break_dur_min?: number;
  clock_at: string;
  first_break_at: string;
  lunch_at: string;
  second_break_at: string;
  day_off: string;
  created_at?: string;
}

export type TimeEntryReport = TimeEntryRecord &
  Pick<ScheduleRecord, 'utc_offset' | 'local_offset' | 'clock_at' | 'effective_date'>;

export interface UserSchedule extends ScheduleRecord {
  date_at: string;
  startOfDuty: boolean;
}

export interface TimeEntryRecord {
  id: number;
  user_id: number;
  sched_id: number;
  category: OptCategory;
  date_at: string;
  start_at: number;
  end_at: number | null;
  elapse_sec: number;
  remarks: string | null;
  user_ip?: string;
  user_agent?: string;
  total_sec: number | null;
}

export interface UserInfo {
  user: UserRecord | null;
  schedules: ScheduleRecord[];
  timeEntries: TimeEntryRecord[];
}

export interface UserCurrentInfo {
  user: UserRecord | null;
  schedule: ScheduleRecord | null;
  timeEntry: TimeEntryRecord | null;
}

export interface RouteProfile {
  name: string;
  path: string;
  role: OptRole[];
  region?: string[];
}

export interface TimeEntryResults {
  id: number;
  date_at: string;
  timestamp: number;
  category: OptCategory;
  sched_id: number;
  timeAction: OptActionState;
}
