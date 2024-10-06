import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { validatePostTime } from '$lib/validation';
import { userReports } from '$lib/server/data/time';
import type { UserInfo } from '$lib/schema';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session || !locals.user) {
    redirect(302, '/login');
  }

  return {
    userTimsheet: await userReports(locals.user.id, '2024-10-01')
  };
};

export const actions = {
  default: async ({ locals }): Promise<Omit<UserInfo, 'user'>> => {
    if (locals.session) {
      console.log(locals.session);
    }
    return {
      timeEntries: [],
      schedules: []
    };
  }
} satisfies Actions;
