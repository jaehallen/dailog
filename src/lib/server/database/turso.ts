import { env } from '$env/dynamic/private';
import { createClient, LibsqlError } from '@libsql/client';
import type { Client, InStatement, ResultSet } from '@libsql/client';

export class DBClient implements TursoController {
  private client: Client;
  constructor(dbClient: Client) {
    this.client = dbClient
  }

  public async get(sql: string, args: {}): Promise<ResultSet | null> {
    try {
      const results = await this.client.execute({
        sql,
        args
      });
      return results;
    } catch (error) {
      if (error instanceof LibsqlError) {
        logError('get', error as Error);
      }
    }

    return null;
  }

  public async batchGet(querries: InStatement[]): Promise<ResultSet[] | null> {
    try {
      const results = await this.client.batch(querries, 'read');
      return results;
    } catch (error: unknown) {
      logError('batchGet', error as Error);
    }
    return null;
  }

  public async set(sql: string, args: {}): Promise<ResultSet | null> {
    let error = {} 
    try {
      const results = await this.client.execute({
        sql,
        args
      });
      return results;
    } catch (error) {
      if (error instanceof LibsqlError) {
        logError('set', error as Error);
        error = error as Error
      }
    }

    return null;
  }
}

export function getClient() {
  if (env.DB_URL === undefined) {
    throw new Error('TURSO_URL env var is not defined');
  }
  if (env.DB_TOKEN === undefined) {
    throw new Error('TURSO_AUTH_TOKEN env var is not defined');
  }

  return createClient({ url: env.DB_URL, authToken: env.DB_TOKEN });
}

interface TursoController {
  get(sql: string, args: Record<string, number | string>): Promise<ResultSet | null>;
  batchGet(queries: InStatement[]): Promise<ResultSet[] | null>;
  set(sql: string, args: {}): Promise<ResultSet | null>;
}

export function log(source: string, message: string | boolean | number): void {
  console.log(`\n==================${source}====================`);
  console.log(message);
}

export function logError(source: string, error: Error) {
  console.log(`\n==================${source}====================`);
  if (error instanceof LibsqlError) {
    console.log(`CODE: ${error.code}`);
  }
  // console.log(error.stack);
  console.log(error.message);
}

