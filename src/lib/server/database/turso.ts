import { env } from '$env/dynamic/private';
import { createClient, type Client } from '@libsql/client';
import { setGlobalDispatcher, Agent } from 'undici';

let mainInstance: Client | undefined = undefined;
let childInstance: Client | undefined = undefined;

setGlobalDispatcher(new Agent({ connect: { timeout: 5000 } }));
export const dbMain = () => {
	if (mainInstance) return mainInstance;
	mainInstance = getTursoClient('main');
	return mainInstance;
};

export const dbChild = () => {
	if (childInstance) return childInstance;
	childInstance = getTursoClient('child');
	return childInstance;
};

function getTursoClient(db: 'main' | 'child') {
	let url: string | undefined = undefined;
	let authToken: string | undefined = undefined;

	if (db === 'main') {
		url = env.DB_PARENT_URL;
		authToken = env.DB_PARENT_TOKEN;
	} else if (db === 'child') {
		url = env.DB_CHILD_URL;
		authToken = env.DB_CHILD_TOKEN;
	}

	if (url === undefined) {
		throw new Error('TURSO_URL env var is not defined');
	}
	if (authToken === undefined) {
		throw new Error('TURSO_AUTH_TOKEN env var is not defined');
	}

	return createClient({ url, authToken });
}
