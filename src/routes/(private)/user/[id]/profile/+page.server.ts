import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserProfile } from '$lib/server/data/user';

export const load = (async ({ locals }) => {
	if (!locals.user) {
		redirect(302, "/login")
	}

	return await getUserProfile(locals.user.id, 20);
}) satisfies PageServerLoad;

