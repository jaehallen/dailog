import { listOfUsers } from '$lib/server/data/admin';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  if (!locals.user) {
    redirect(302, '/login');
  }

  return {
    listOfUsers: await listOfUsers(locals.user, { limit: 50 })
  };
}) satisfies PageServerLoad;

