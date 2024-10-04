export const USERROLE = ['admin', 'lead', 'poc', 'user'] as const;
export const CATEGORY = ['clock', 'break', 'lunch', 'bio', 'coffee', 'clinic', 'meeting', 'coaching'] as const;
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'] as const;
export const ACTIONSTATE = ['start', 'end'] as const;
export const DEFAULT_MIN_WORKDATE = 18;

export type OptRole = (typeof USERROLE)[number];
export type OptCategory = (typeof CATEGORY)[number];
export type OptActionState = (typeof ACTIONSTATE)[number];
export type OptWeekdays = (typeof WEEKDAYS)[number];
export const BREAKTYPE: Record<string, OptCategory> = {};

export interface ZPostTime {
	id: number;
	category: OptCategory;
	timeAction: OptActionState;
	date_at: string;
	sched_id: number;
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
}

export interface UserProfile extends UserRecord {
	teamlead: string;
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

export interface TimeEntryRecord {
	id: number;
	user_id: number;
	sched_id: number;
	category: OptCategory;
	date_at: string;
	start_at: number;
	end_at: number | null;
	elapse_sec: number;
	user_ip?: string;
	user_agent?: string;
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
}

export interface TimeEntryResults {
	id: number;
	date_at: string;
	timestamp: number;
	category: OptCategory;
	sched_id: number;
	timeAction: OptActionState;
}

export const ROUTES: RouteProfile[] = [
	{
		name: 'Profile',
		path: `/user/[id]/profile`,
		role: ['admin', 'lead', 'poc', 'user']
	},
	{
		name: 'Timesheets',
		path: `/user/[id]/timesheets`,
		role: ['admin', 'lead', 'poc', 'user']
	},
	{
		name: 'Dashboard',
		path: '/admin',
		role: ['admin', 'lead', 'poc']
	},
	{
		name: 'Users',
		path: '/admin/users',
		role: ['admin', 'lead', 'poc']
	},
	{
		name: 'Schedules',
		path: '/admin/schedules',
		role: ['admin', 'lead', 'poc']
	},
	{
		name: 'Register',
		path: '/admin/register',
		role: ['admin', 'lead', 'poc']
	}
];

export const TIMESHEETINFO: TimesheetStateInfo = {
	confirm: false,
	state: 'end',
	nextState: 'start',
	category: 'break',
	sched_id: 0,
	date_at: '',
	local_offset: 8,
	isBreak: false,
	id: 0,
	timestamp: 0,
	lunched: false,
	message: ''
};

export const STORAGENAME = {
	timesheet: 'user-timesheet',
	action: 'user-action',
}


export const CONFIRMCATEGORY: Record<OptCategory, Record<OptActionState, string>> = {
	clock: {
		start: "Are you sure you'd like to <strong>Clock In</strong> now?",
		end: 'Would you like to conclude your <strong>Work Today</strong>?'
	},
	break: {
		start: "Are you sure you'd like to take your <strong>Short Break</strong> now?",
		end: 'Would you like to conclude your <strong>Short Break</strong>?'
	},
	lunch: {
		start: "Are you sure you'd like to take your <strong>Lunch Break</strong> now?",
		end: 'Would you like to conclude your <strong>Lunch Break</strong>?'
	},
	bio: {
		start: "Are you sure you'd like to take your <strong>Restroom Break</strong> now?",
		end: 'Would you like to conclude your <strong>Restroom Break</strong>?'
	},
	coffee: {
		start: "Are you sure you'd like to take your <strong>Coffee Break</strong> now?",
		end: 'Would you like to conclude your <strong>Coffee Break</strong>?'
	},
	clinic: {
		start: "Are you sure you'd like to take your <strong>Medical Time</strong> now?",
		end: 'Would you like to conclude your <strong>Medical Medical</strong>?'
	},
	meeting: {
		start: "Are you sure you'd like to take your <strong>Meeting</strong> now?",
		end: 'Would you like to conclude your <strong>Meeting</strong>?'
	},
	coaching: {
		start: "Are you sure you'd like to take your <strong>Coaching</strong> now?",
		end: 'Would you like to conclude your <strong>Coaching</strong>?'
	}
};
