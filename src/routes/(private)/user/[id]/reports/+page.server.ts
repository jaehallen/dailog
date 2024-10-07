import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { userReports } from '$lib/server/data/time';
import { z } from 'zod';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session || !locals.user) {
    redirect(302, '/login');
  }

  const today = new Date().toISOString().split('T')[0];

  return {
    userTimeData: await userReports(locals.user.id, today)
  };
};

export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      return redirect(302, '/login');
    }

    const form = await request.formData();
    const date = form.get('date');

    const dateValidator = z.coerce.string().date().safeParse(date);

    if (dateValidator.success && dateValidator.data) {
      return userReports(locals.user.id, dateValidator.data);
    }

    return fail(401, { message: 'Invalid Date' });
  }
} satisfies Actions;
