import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/utility';
import { validateRegistration } from '$lib/validation';
import { insertUser } from '$lib/server/data/admin';

export const load: PageServerLoad = async ({ locals }) => {
  if (!isAdmin(locals?.user?.role)) {
    redirect(302, `/user/${locals?.user?.id}/timesheets`);
  }

  return {};
};

export const actions = {
  default: async ({ request, locals }) => {
    if (!isAdmin(locals?.user?.role)) {
      return fail(401, { message: 'User not authorized' });
    }

    const form = await request.formData();
    const validRegister = validateRegistration.safeParse(Object.fromEntries(form));

    if (!validRegister.success) {
      return fail(404, { message: validRegister.error });
    }

    const { data, error } = await insertUser(validRegister.data);
    if (error) {
      return fail(404, { message: error.message });
    }

    return {
      user: data
    };
  }
} satisfies Actions;
