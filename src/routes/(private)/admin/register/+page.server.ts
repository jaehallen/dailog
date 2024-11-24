import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { isEditor } from '$lib/permission';
import { validateRegistration } from '$lib/validation';
import { insertUser } from '$lib/server/data/admin';

export const load: PageServerLoad = async ({ locals }) => {
  if (!isEditor(locals?.user?.role) && !isEditor(locals?.user?.role)) {
    redirect(302, `/user/${locals?.user?.id}/timesheets`);
  }

  return {};
};

export const actions = {
  default: async ({ request, locals, fetch }) => {
    if (!isEditor(locals?.user?.role)) {
      return fail(401, { message: 'User not authorized' });
    }

    const form = await request.formData();
    const validRegister = validateRegistration.safeParse(Object.fromEntries(form));

    if (!validRegister.success) {
      return fail(404, { message: validRegister.error });
    }

    const { data, error } = await insertUser(fetch, validRegister.data);
    if (error) {
      return fail(404, { message: error.message });
    }

    return {
      user: data
    };
  }
} satisfies Actions;
