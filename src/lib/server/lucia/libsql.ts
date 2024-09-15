import { SQLiteAdapterMod } from './sqlite';
import type { Controller, TableNames } from './sqlite';
import type { Client } from '@libsql/client';

export class TursoAdapter extends SQLiteAdapterMod {
	constructor(db: Client, tableNames: TableNames) {
		super(new LibSQLController(db), tableNames);
	}
}

class LibSQLController implements Controller {
	private db: Client;
	constructor(db: Client) {
		this.db = db;
	}

	public async get<T>(sql: string, args: any[]): Promise<T | null> {
		const result = await this.db.execute({
			sql,
			args
		});
		return (result.rows.at(0) as T) ?? null;
	}

	public async getAll<T>(sql: string, args: any[]): Promise<T[]> {
		const result = await this.db.execute({
			sql,
			args
		});
		return result.rows as T[];
	}

	public async execute(sql: string, args: any[]): Promise<void> {
		await this.db.execute({
			sql,
			args
		});
	}
}
