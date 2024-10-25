import { addUserSchedule, listOfUsers, updateUser, userFilters } from '$lib/server/data/admin';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { validateSchedule, validateUser, validateSearch } from '$lib/validation';
import { isAdmin, isEditor } from '$lib/utility';

export const load = (async ({ locals, url }) => {
  if (!locals.user) {
    redirect(302, '/login');
  }

  if (!isEditor(locals.user.role)) {
    redirect(302, '/');
  }

  const filterOptions = userFilters(locals.user, url.searchParams);
  return {
    queries: filterOptions,
    listOfUsers: await listOfUsers(filterOptions)
  };
}) satisfies PageServerLoad;

export const actions = {
  filter: async (event) => {
    const request = event.request;
    console.log(event.url)
    console.log(event.params)
    const form = await request.formData();
    const validFilter = validateSearch.safeParse(Object.fromEntries(form));

    if (!validFilter.success) {
      return fail(401, { message: 'Invalid Filter' });
    }

    return {
      queries: validFilter.data,
      listOfUsers: await listOfUsers(validFilter.data)
    };
  },
  'add-schedule': async ({ request, locals }) => {
    if (!locals.user || !locals.session) {
      return fail(404, { message: 'User not found' });
    }

    if (!isEditor(locals.user.role)) {
      return fail(401, { message: 'User not authorized' });
    }

    const form = await request.formData();
    const validSched = validateSchedule.safeParse(Object.fromEntries(form));

    if (!validSched.success) {
      return fail(404, { message: validSched.error });
    }

    return {
      schedule: await addUserSchedule(validSched.data)
    };
  },

  'update-user': async ({ request, locals }) => {
    if (!locals.user || !locals.session) {
      return fail(404, { message: 'User not found' });
    }

    if (!isAdmin(locals.user.role)) {
      return fail(401, { message: 'User not authorized' });
    }

    const form = await request.formData();
    const validUser = validateUser.safeParse(Object.fromEntries(form));

    if (!validUser.success) {
      return fail(404, { message: validUser.error });
    }
    const updates = await updateUser(validUser.data);

    if (updates) {
      const { password_hash, preferences, ...user } = updates;
      return {
        user
      };
    }

    return null;
  }
} satisfies Actions;
