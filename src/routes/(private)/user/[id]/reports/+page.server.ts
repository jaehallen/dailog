import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/database/db-controller';
import { getWeekRange } from '$lib/utility';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session || !locals.user) {
    redirect(302, '/login');
  }

  const [today] = new Date().toISOString().split('T');
  const { data, error } = await db.getTimeEntries(locals.user.id, getWeekRange(today));

  if (error) {
    return {
      userTimesheet: null,
      error
    };
  }

  return {
    userTimesheet: data
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

    if (!dateValidator.success) {
      return fail(401, { message: 'Invalid Date' });
    }

    const { data, error } = await db.getTimeEntries(
      locals.user.id,
      getWeekRange(dateValidator.data)
    );

    if (error) {
      return fail(401, { message: error.message });
    }

    return {
      userTimesheet: data
    };
  }
} satisfies Actions;
