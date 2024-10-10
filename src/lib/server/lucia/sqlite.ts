import type {
  DatabaseSession,
  RegisteredDatabaseSessionAttributes,
  DatabaseUser,
  RegisteredDatabaseUserAttributes,
  UserId
} from 'lucia';

import type { Client } from '@libsql/client';

export class TursoClient {
  private controller: Client;

  constructor(controller: Client) {
    this.controller = controller;
  }

  public async deleteSession(sessionId: string): Promise<void> {
    await this.controller.execute({
      sql: `DELETE FROM sessions WHERE id = ?`,
      args: [sessionId]
    });
  }

  public async deleteUserSessions(userId: UserId): Promise<void> {
    await this.controller.execute({
      sql: `DELETE FROM sessions WHERE user_id = ?`,
      args: [userId]
    });
  }

  // public async getSessionAndUser(
  // 	sessionId: string
  // ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
  // 	const { rows = [] } = await this.controller.execute({
  // 		sql: `select * from view_sessions where id = ? ORDER BY effective_date desc limit 1`,
  // 		args: [sessionId]
  // 	});
  //
  // 	if (!rows.length) {
  // 		return [null, null];
  // 	}
  // 	const { user_id, id, expires_at, ...user } = rows.at(0) as unknown as SessionSchema &
  // 		UserSchema;
  // 	const databaseSession = transformIntoDatabaseSession({
  // 		id,
  // 		expires_at,
  // 		user_id
  // 	} satisfies SessionSchema);
  // 	const databaseUser = transformIntoDatabaseUser({ id: user_id, ...user });
  // 	return [databaseSession, databaseUser];
  // }
  //
  public async getSessionAndUser(
    sessionId: string
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const { rows = [] } = await this.controller.execute({
      sql: `SELECT sessions.*, users.active, users.lead_id, users.lock_password, users.name, users.region, users.role FROM sessions
							LEFT JOIN users on users.id = sessions.user_id
							WHERE sessions.id = ?`,
      args: [sessionId]
    });

    if (!rows.length) {
      return [null, null];
    }
    const { user_id, id, expires_at, ...user } = rows.at(0) as unknown as SessionSchema &
      UserSchema;
    const databaseSession = transformIntoDatabaseSession({
      id,
      expires_at,
      user_id
    } satisfies SessionSchema);
    const databaseUser = transformIntoDatabaseUser({ id: user_id, ...user });
    return [databaseSession, databaseUser];
  }

  public async getUserSessions(userId: UserId): Promise<DatabaseSession[]> {
    const result = await this.controller.execute({
      sql: `SELECT * FROM sessions WHERE user_id = ?`,
      args: [userId]
    });

    return result.rows.map((val) => {
      return transformIntoDatabaseSession(val as unknown as SessionSchema);
    });
  }

  public async setSession(databaseSession: DatabaseSession): Promise<void> {
    const value: SessionSchema = {
      id: databaseSession.id,
      user_id: databaseSession.userId,
      expires_at: Math.floor(databaseSession.expiresAt.getTime() / 1000),
      ...databaseSession.attributes
    };
    const entries = Object.entries(value).filter(([_, v]) => v !== undefined);
    const columns = entries.map(([k]) => escapeName(k));
    const placeholders = Array(columns.length).fill('?');
    const values = entries.map(([_, v]) => v);
    await this.controller.execute({
      sql: `INSERT INTO sessions (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
      args: [...values]
    });
  }

  public async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    await this.controller.execute({
      sql: `UPDATE sessions SET expires_at = ? WHERE id = ?`,
      args: [Math.floor(expiresAt.getTime() / 1000), sessionId]
    });
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.controller.execute({
      sql: `DELETE FROM sessions WHERE expires_at <= ?`,
      args: [Math.floor(Date.now() / 1000)]
    });
  }
}

interface SessionSchema extends RegisteredDatabaseSessionAttributes {
  id: string;
  user_id: number;
  expires_at: number;
}

interface UserSchema extends RegisteredDatabaseUserAttributes {
  id: number;
}

function transformIntoDatabaseSession(raw: SessionSchema): DatabaseSession {
  const { id, user_id: userId, expires_at: expiresAtUnix, ...attributes } = raw;
  return {
    userId,
    id,
    expiresAt: new Date(expiresAtUnix * 1000),
    attributes
  };
}

function transformIntoDatabaseUser(raw: UserSchema): DatabaseUser {
  const { id, ...attributes } = raw;
  return {
    id,
    attributes
  };
}

function escapeName(val: string): string {
  return '`' + val + '`';
}
