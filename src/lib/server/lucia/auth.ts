import { Lucia, TimeSpan } from 'lucia';
import { TursoAdapter } from './libsql';
import { dbChild } from '../database/turso';
import { dev } from '$app/environment';
import type { UserRecord } from '../database/schema';

const adapter = new TursoAdapter(dbChild(), {
	user: 'users',
	session: 'sessions'
});

export const lucia = new Lucia(adapter, {
	sessionExpiresIn: new TimeSpan(2, 'm'),
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