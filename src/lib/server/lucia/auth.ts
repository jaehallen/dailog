import { Lucia } from 'lucia';
import { TursoClient } from './sqlite';
import { getClient } from '../database/turso';
import { dev } from '$app/environment';
import type { RouteProfile, UserRecord } from '$lib/schema';
import { ROUTES } from '$lib/schema';

const adapter = new TursoClient(getClient());
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !dev
    }
  },
  getUserAttributes: (attributes) => {
    return attributes;
  }
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    UserId: number;
    DatabaseUserAttributes: Omit<UserRecord, 'id'| 'password_hash'>;
  }
}

export function routeProfile(user: Pick<UserRecord, 'id' | 'role'>): RouteProfile[] {
  return ROUTES.reduce((arr: RouteProfile[], route: RouteProfile) => {
    if (route.role.includes(user.role)) {
      arr.push({ ...route, path: route.path.replace('[id]', String(user.id)) });
    }

    return arr;
  }, []);
}

export function isProtectedRoute(pathname: string): boolean {
  return ['/user', '/admin'].some((str) => pathname.startsWith(str));
}

export function isPublicRoute(url: URL) {
  return ['/login', '/', '/api/logout'].includes(url.pathname);
}
// Use when schedule is included
// type UserAttributes = Omit<UserRecord, 'id'> & {
// 	sched_id: number;
// 	date_at: string;
// 	effective_date: string;
// 	utc_offset: number;
// 	local_offset: number;
// 	clock_at: string;
// };
