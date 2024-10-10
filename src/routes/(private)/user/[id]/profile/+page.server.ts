import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getUserProfile, userPasswordReset } from '$lib/server/data/user';
import { validatePasswordReset } from '$lib/validation';

export const load = (async ({ locals }) => {
  if (!locals.user) {
    redirect(302, '/login');
  }

  return getUserProfile(locals.user.id, 20);
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      redirect(302, '/login');
    }
    const form = await request.formData();
    const valid = validatePasswordReset.safeParse({
      oldPassword: form.get('old'),
      newPassword: form.get('new')
    });

    if (!valid.success) {
      return fail(400, { invalidInputs: true });
    }

    const response = await userPasswordReset(locals.user.id, valid.data);

    if (!response?.success) {
      return fail(400, { ...response });
    }

    return response;
  }
} satisfies Actions;
