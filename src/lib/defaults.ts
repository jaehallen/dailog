import type { OptActionState, OptCategory, RouteProfile, TimesheetStateInfo } from './types/schema';


export const USERROLE = ['admin', 'lead', 'poc', 'user'] as const;
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'] as const;
export const ACTIONSTATE = ['start', 'end'] as const;
export const DEFAULT_MIN_WORKDATE = 18;
export const DEFAULT_GRACE_HOUR = 4;
export const CATEGORY = [
  'clock',
  'break',
  'lunch',
  'bio',
  'coffee',
  'clinic',
  'meeting',
  'coaching'
] as const;


//DICEBREAR LINK FOR AVATAR
export const AVATAR_SRC =
	'https://api.dicebear.com/9.x/initials/svg?seed=Jessica&radius=50&fontWeight=900';

export const ROUTES: RouteProfile[] = [
	{
		name: 'Profile',
		path: '/user/[id]/profile',
		role: ['admin', 'lead', 'poc', 'user']
	},
	{
		name: 'Timesheets',
		path: '/user/[id]/timesheets',
		role: ['admin', 'lead', 'poc', 'user']
	},
	{
		name: 'Reports',
		path: '/user/[id]/reports',
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
	action: 'user-action'
};

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
