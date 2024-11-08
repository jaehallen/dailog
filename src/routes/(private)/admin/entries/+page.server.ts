import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { isEditor } from '$lib/utility';
import { validateTimeEntriesFilter } from '$lib/validation';
import { db } from '$lib/server/database/db-controller';

export const load = (async ({ locals, url }) => {
  if (!locals.user) {
    redirect(302, '/login')
  }

  return {
    entriesSearch: {
      search: url.searchParams.get('search') ?? '',
      date_at: url.searchParams.get('date_at') ?? new Date().toISOString().substring(0, 10),
      region: url.searchParams.get('region') ?? locals.user.region
    }
  };
}) satisfies PageServerLoad;

export const actions = {
  search: async ({ locals, request, url }) => {
    if (!locals.user) {
      return fail(404, { message: 'User not found' });
    }

    if (!isEditor(locals.user.role)) {
      return fail(401, { message: 'User not authorized' });
    }


    const form = await request.formData();
    const day = parseInt(url.searchParams.get('day') || '');
    const offsetDate = offsetDateByWeekday(form.get('date_at') as string, day);
    form.set('date_at', offsetDate)
    const validSearch = validateTimeEntriesFilter.safeParse(Object.fromEntries(form));

    if (!validSearch.success) {
      return fail(401, { message: validSearch.error.errors });
    }

    if (!validSearch.data) {
      return fail(401, { message: 'Invalid Inputs' });
    }

    const { data, error } = await db.searchUserTimeEntries(validSearch.data);

    if (error) {
      return fail(401, { message: error.message });
    }

    return {
      userEntries: data,
      queries: { ...validSearch.data }
    };
  }
} satisfies Actions;

function offsetDateByWeekday(date: string | null, weekday: number): string {
  let temp = typeof date == 'string' ? new Date(date) : new Date();
  let day = (!isNaN(weekday) && weekday >= 0 ? weekday : temp.getDay())
  temp.setDate(temp.getDate() - temp.getDay() + day);
  return temp.toISOString().substring(0, 10)
}

