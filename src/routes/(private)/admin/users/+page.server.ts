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

  const temp = userFilters(locals.user, url.searchParams);
  const filterData = validateSearch.safeParse(temp);

  if (filterData.error) {
    return {
      queries: null,
      listOfUsers: null
    };
  }
  console.log(temp);
  console.log(filterData.data);

  return {
    queries: filterData.data,
    listOfUsers: await listOfUsers(filterData.data)
  };
}) satisfies PageServerLoad;

export const actions = {
  filter: async ({ request }) => {
    const form = await request.formData();

    const validFilter = validateSearch.safeParse(Object.fromEntries(form));
    if (!validFilter.success) {
      return fail(401, { message: 'Invalid Filter' });
    }

    console.log(validFilter.data);

    return {
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
