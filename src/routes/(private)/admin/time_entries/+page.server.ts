import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { isViewer } from '$lib/permission';
import { validateTimeEntriesFilter } from '$lib/validation';
import { db } from '$lib/server/database/db-controller';

export const load = (async ({ locals, url }) => {
  if (!locals.user || !isViewer(locals.user.role)) {
    redirect(302, '/login');
  }

  const q = {
    search: url.searchParams.get('search') ?? '',
    date_at: url.searchParams.get('date_at') ?? new Date().toISOString().substring(0, 10),
    region: url.searchParams.get('region') ?? locals.user.region
  };

  const validSearch = validateTimeEntriesFilter.safeParse(q);

  if (!validSearch.success || !validSearch.data) {
    return {};
  }

  const { data, error } = await db.searchUserTimeEntries(validSearch.data);

  if (error) {
    return {};
  }

  return {
    entriesQuery: q,
    entriesResults: data || []
  };
}) satisfies PageServerLoad;

export const actions = {
  search: async ({ locals, request, url }) => {
    if (!locals.user) {
      return fail(404, { message: 'User not found' });
    }

    if (!isViewer(locals.user.role)) {
      return fail(401, { message: 'User not authorized' });
    }

    const form = await request.formData();
    const day = parseInt(url.searchParams.get('day') || '');
    const offsetDate = offsetDateByWeekday(form.get('date_at') as string, day);
    form.set('date_at', offsetDate);
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
      entriesResults: data,
      queries: { ...validSearch.data }
    };
  }
} satisfies Actions;

function offsetDateByWeekday(date: string | null, weekday: number): string {
  let temp = typeof date == 'string' ? new Date(date) : new Date();
  let day = !isNaN(weekday) && weekday >= 0 ? weekday : temp.getDay();
  temp.setDate(temp.getDate() - temp.getDay() + day);
  return temp.toISOString().substring(0, 10);
}
