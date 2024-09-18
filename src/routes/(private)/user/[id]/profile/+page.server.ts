import type { PageServerLoad } from './$types';
import { validateUser } from '$lib/server/data/user';

export const load = (async ({ locals }) => {
	return {};
}) satisfies PageServerLoad;

