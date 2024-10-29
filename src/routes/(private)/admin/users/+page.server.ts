import {
  addUserSchedule,
  listOfUsers,
  searchUsers,
  updateUser,
  userFilters
} from '$lib/server/data/admin';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { validateSchedule, validateUser, validateSearch } from '$lib/validation';
import { isAdmin, isEditor, isLepo } from '$lib/utility';
import { TEMPID } from '$lib/defaults';

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
  filter: async ({ locals, request }) => {
    if (!locals.user) {
      return fail(404, { message: 'User not found' });
    }
    const admin = isAdmin(locals.user.role);
    const form = await request.formData();
    form.set('page_total', '');
    form.set('page_index', '');
    form.set('last_id', admin ? '0' : TEMPID.toString());
    if (!admin) {
      form.set('region', locals.user.region);
    }
    return await queryData(form);
  },

  'prev-page': async ({ request, locals }) => {
    if (!locals.user) {
      return fail(404, { message: 'User not found' });
    }
    const form = await request.formData();
    if (isLepo(locals.user.role)) {
      form.set('region', locals.user.region);
    }
    return await queryData(form);
  },

  'next-page': async ({ request, locals }) => {
    if (!locals.user) {
      return fail(404, { message: 'User not found' });
    }
    const form = await request.formData();
    if (isLepo(locals.user.role)) {
      form.set('region', locals.user.region);
    }
    return await queryData(form);
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

    const { data, error } = await addUserSchedule(validSched.data);

    if (error) {
      return fail(404, { message: error.message });
    }

    return {
      schedule: data
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

    const { data, error } = await updateUser(validUser.data);

    if (error) {
      return fail(404, { message: error.message });
    }

    const { password_hash, preferences, ...user } = data;

    return {
      user
    };
  }
} satisfies Actions;

async function queryData(form: FormData) {
  const validFilter = validateSearch.safeParse(Object.fromEntries(form));

  if (!validFilter.success) {
    return fail(401, { message: 'Invalid Filter' });
  }

  if (validFilter.data.search) {
    return {
      queries: { ...validFilter.data },
      listOfUsers: await searchUsers(validFilter.data)
    };
  }

  return {
    queries: { ...validFilter.data },
    listOfUsers: await listOfUsers(validFilter.data)
  };
}
