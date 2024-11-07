import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { isEditor } from '$lib/utility';
import { validateTimeEntriesFilter } from '$lib/validation';
import { db } from '$lib/server/database/db-controller';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  search: async ({ locals, request, url }) => {
    if (!locals.user) {
      return fail(404, { message: 'User not found' });
    }

    if (!isEditor(locals.user.role)) {
      return fail(401, { message: 'User not authorized' });
    }

    const day = url.searchParams.get('day');
    console.log(day);

    const form = await request.formData();
    const validSearch = validateTimeEntriesFilter.safeParse(Object.fromEntries(form));

    if (!validSearch.success) {
      return fail(401, { message: validSearch.error.errors });
    }

    if (!validSearch.data) {
      return fail(401, { message: 'Invalid Inputs' });
    }

    const { data, error } = await db.searchUserTimeEntries(validSearch.data);

    if (error) {
      return fail(401, { message: error.message });
    }

    return {
      userEntries: data
    };
  }
} satisfies Actions;

