import type { OptRole, RouteProfile } from "$lib/types/schema";

/** Check if user is Admin only ['admin'] */
export const isAdmin = (role: OptRole | undefined | null) => role === 'admin';
/** Check if user can update users info ['admin','editor'] */
export const isEditor = (role: OptRole | undefined | null) =>
  ['admin', 'editor'].includes(role ?? '');
/** Check if user can update user schedules ['admin', 'editor', 'scheduler'] */
export const isScheduler = (role: OptRole | undefined | null) =>
  ['admin', 'editor', 'scheduler'].includes(role ?? '');
/** Check if user if it can view Time Entries */
export const isViewer = (role: OptRole | undefined | null) =>
  ['admin', 'editor', 'scheduler', 'lead'].includes(role ?? '');
/** Default access */
export const isUser = (role: OptRole | undefined | null) =>
  ['admin', 'editor', 'scheduler', 'lead', 'poc', 'user'].includes(role ?? '')

export const ROUTES: RouteProfile[] = [
  {
    name: 'Profile',
    path: '/user/[id]/profile',
    isPermitted: (role: OptRole) => isUser(role)
  },
  {
    name: 'Timesheets',
    path: '/user/[id]/timesheets',
    isPermitted: (role: OptRole) => isUser(role)
  },
  {
    name: 'Reports',
    path: '/user/[id]/reports',
    isPermitted: (role: OptRole, region: string) => isUser(role) && ['APAC'].includes(region)
  },
  {
    name: 'Time Entries',
    path: '/admin/time_entries',
    isPermitted: (role: OptRole) => isViewer(role)
  },
  {
    name: 'Users',
    path: '/admin/users',
    isPermitted: (role: OptRole) => isScheduler(role)
  },
  {
    name: 'Register',
    path: '/admin/register',
    isPermitted: (role: OptRole) => isEditor(role)
  }
];

export function isProtectedRoute(pathname: string): boolean {
  return ['/user', '/admin'].some((str) => pathname.startsWith(str));
}

export function isPublicRoute(url: URL) {
  return ['/login', '/', '/api/logout'].includes(url.pathname);
}
