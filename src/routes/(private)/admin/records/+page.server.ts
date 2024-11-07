import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isEditor} from '$lib/utility';
import { validateTimeEntriesFilter } from '$lib/validation';
import { db } from '$lib/server/database/db-controller';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  'search': async ({ locals, request }) => {
    if (!locals.user) {
      return fail(404, { message: "User not found" });
    }

    if (!isEditor(locals.user.role)) {
      return fail(401, { message: "User not authorized" });
    }

    const form = await request.formData();
    const validSearch = validateTimeEntriesFilter.safeParse(Object.fromEntries(form))

    if (!validSearch.success) {
      return fail(401, { message: validSearch.error.errors });
    }

    if (!validSearch.data) {
      return fail(401, { message: "Invalid Inputs" })
    }

    const { data, error } = await db.searchUserTimeEntries(validSearch.data)

    if (error) {
      return fail(401, { message: error.message })
    }

    return {
      userEntries: data
    }
  }
}