import { Lucia, TimeSpan } from 'lucia';
import { TursoClient } from './sqlite';
import { getClient } from '../database/turso';
import { dev } from '$app/environment';
import type { RouteProfile, UserRecord } from '$lib/types/schema';
import { ROUTES } from '$lib/defaults';
import { env } from '$env/dynamic/private';
import { isAdmin } from '$lib/utility';

const adapter = new TursoClient(getClient());
const max = parseInt(env.MIN_WORKDATE_DIFF ?? '') || 10;
export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(max, 'h'),
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
    DatabaseUserAttributes: Omit<UserRecord, 'id' | 'password_hash'>;
  }
}

export function routeProfile(user: Pick<UserRecord, 'id' | 'role' | 'region'>): RouteProfile[] {
  return ROUTES.reduce((arr: RouteProfile[], route: RouteProfile) => {
    if (!isAdmin(user.role) && route.region && !route.region.includes(user.region)) {
      return arr;
    }

    if (!route.role.includes(user.role)) {
      return arr;
    }

    arr.push({ ...route, path: route.path.replace('[id]', String(user.id)) });
    return arr;
  }, []);
}

export function isProtectedRoute(pathname: string): boolean {
  return ['/user', '/admin'].some((str) => pathname.startsWith(str));
}

export function isPublicRoute(url: URL) {
  return ['/login', '/', '/api/logout'].includes(url.pathname);
}
