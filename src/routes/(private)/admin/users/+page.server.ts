import { addUserSchedule, listOfUsers, updateUser } from '$lib/server/data/admin';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { validateSchedule, validateUser } from '$lib/validation';

export const load = (async ({ locals }) => {
  if (!locals.user) {
    redirect(302, '/login');
  }

  return {
    session: locals.session,
    listOfUsers: await listOfUsers(locals.user, { limit: 25 })
  };
}) satisfies PageServerLoad;

export const actions = {
  'add-schedule': async ({ request, locals }) => {
    if (!locals.user || !locals.session) {
      return fail(404, { message: 'User not found' });
    }

    if (!['admin', 'lead', 'poc'].includes(locals.user.role)) {
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
  'update-user': async({request, locals}) => {
    if (!locals.user || !locals.session) {
      return fail(404, { message: 'User not found' });
    }

    if(!['admin'].includes(locals.user.role)){
      return fail(401, { message: 'User not authorized' });
    }

    const form = await request.formData();
    const validUser = validateUser.safeParse(Object.fromEntries(form))

    if(!validUser.success) {
      return fail(404, { message: validUser.error });
    }

    return {
      user: await updateUser(validUser.data)
    }
  }
} satisfies Actions;
