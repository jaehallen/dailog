import type {
	Adapter,
	DatabaseSession,
	RegisteredDatabaseSessionAttributes,
	DatabaseUser,
	RegisteredDatabaseUserAttributes,
	UserId
} from 'lucia';

export class SQLiteAdapterMod implements Adapter {
	private controller: Controller;

	private escapedUserTableName: string;
	private escapedSessionTableName: string;

	constructor(controller: Controller, tableNames: TableNames) {
		this.controller = controller;
		this.escapedSessionTableName = escapeName(tableNames.session);
		this.escapedUserTableName = escapeName(tableNames.user);
	}

	public async deleteSession(sessionId: string): Promise<void> {
		await this.controller.execute(`DELETE FROM ${this.escapedSessionTableName} WHERE id = ?`, [
			sessionId
		]);
	}

	public async deleteUserSessions(userId: UserId): Promise<void> {
		await this.controller.execute(`DELETE FROM ${this.escapedSessionTableName} WHERE user_id = ?`, [
			userId
		]);
	}

	public async getSessionAndUser(
		sessionId: string
	): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
		const result = await this.controller.get<UserSchema & SessionSchema>(
			`SELECT session.*, user.active, user.name, user.role, user.region, user.lead_id, user.lock_password
					FROM ${this.escapedSessionTableName} session 
					INNER JOIN ${this.escapedUserTableName} user ON user.id = session.user_id
					WHERE session.id = ?`,
			[sessionId]
		);

		if (!result) {
			return [null, null];
		}
		const { user_id, id, expires_at, ...user } = result;
		const databaseSession = transformIntoDatabaseSession({
			id,
			expires_at,
			user_id
		});
		const databaseUser = transformIntoDatabaseUser({ id: user_id, ...user });
		return [databaseSession, databaseUser];
	}

	public async getUserSessions(userId: UserId): Promise<DatabaseSession[]> {
		const result = await this.controller.getAll<SessionSchema>(
			`SELECT * FROM ${this.escapedSessionTableName} WHERE user_id = ?`,
			[userId]
		);
		return result.map((val) => {
			return transformIntoDatabaseSession(val);
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
		await this.controller.execute(
			`INSERT INTO ${this.escapedSessionTableName} (${columns.join(
				', '
			)}) VALUES (${placeholders.join(', ')})`,
			values
		);
	}

	public async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
		await this.controller.execute(
			`UPDATE ${this.escapedSessionTableName} SET expires_at = ? WHERE id = ?`,
			[Math.floor(expiresAt.getTime() / 1000), sessionId]
		);
	}

	public async deleteExpiredSessions(): Promise<void> {
		await this.controller.execute(
			`DELETE FROM ${this.escapedSessionTableName} WHERE expires_at <= ?`,
			[Math.floor(Date.now() / 1000)]
		);
	}
}

export interface TableNames {
	user: string;
	session: string;
}

export interface Controller {
	execute(sql: string, args: any[]): Promise<void>;
	get<T>(sql: string, args: any[]): Promise<T | null>;
	getAll<T>(sql: string, args: any[]): Promise<T[]>;
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
