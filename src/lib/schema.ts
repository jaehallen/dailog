const USERROLE = ['admin', 'lead', 'poc', 'user'] as const;
const CATEGORY = ['clock', 'break', 'lunch', 'coffee', 'clinic'] as const;

export type OptRole = (typeof USERROLE)[number];
export type OptCategory = (typeof CATEGORY)[number];

export const BREAKTYPE: Record<string, OptCategory> = {};

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

export interface SessionRecord {
	id: string;
	user_id: number;
	expires_at: number;
	sched_id: number;
	date_at: string;
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
	created_at?: string;
}

export interface TimeEntryRecord {
	id: number;
	user_id: number;
	sched_id: number;
	category: OptCategory;
	date_at: string;
	start_at: number;
	end_at: number;
	elapse_sec: number;
	user_ip?: string;
	user_agent?: string;
}

export interface UserInfo {
	user: UserRecord | null;
	schedules: ScheduleRecord[] | null;
	timeEntries: TimeEntryRecord[] | null;
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
		name: 'Register',
		path: '/admin/register',
		role: ['admin', 'lead', 'poc']
	}
];
