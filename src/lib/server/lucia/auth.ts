import { Lucia, TimeSpan } from 'lucia';
import { TursoClient } from './sqlite';
import { getClient } from '../database/turso';
import { dev } from '$app/environment';
import type {  UserRecord } from '$lib/types/schema';
import { env } from '$env/dynamic/private';

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

