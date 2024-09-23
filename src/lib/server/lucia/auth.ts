import { Lucia, TimeSpan } from 'lucia';
import { TursoAdapter } from './libsql';
import { dbChild } from '../database/turso';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { RouteProfile, UserRecord } from '$lib/schema';
import { ROUTES } from '$lib/schema';

const MAX_HOUR = parseInt(env.MIN_WORKDATE_DIFF || '') / 2 || 10;
const adapter = new TursoAdapter(dbChild(), {
	user: 'users',
	session: 'sessions'
});
export const lucia = new Lucia(adapter, {
	sessionExpiresIn: new TimeSpan(MAX_HOUR, 'h'),
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return attributes;
	},
	getSessionAttributes: (attributes) => {
		return attributes;
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		UserId: number;
		DatabaseUserAttributes: Omit<UserRecord, 'id'>;
		DatabaseSessionAttributes: DatabaseSessionAttributes;
	}
	interface DatabaseSessionAttributes {
		sched_id: number;
		date_at: string;
	}
}

export const routeProfile = (
	user: Pick<UserRecord, 'id' | 'role'>,
	pathname: string
): RouteProfile[] => {
	const userRoute = ROUTES.filter((el) => el.role.includes(user.role)).map((el) => {
		el.path = el.path.replace('[id]', String(user.id));
		return el;
	});

	if (!userRoute.find((el: RouteProfile) => el.path === pathname)) {
		return [];
	}

	return userRoute;
};

export const isPublicRoute = (url: URL) => {
	return ['/login', '/', '/api/logout'].includes(url.pathname);
};
