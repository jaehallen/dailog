import { userLists } from '$lib/server/data/admin';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
    if (!locals.user) {
        redirect(302, '/login');
    }

    return {
        usersList: await userLists(locals.user)
    };
}) satisfies PageServerLoad;