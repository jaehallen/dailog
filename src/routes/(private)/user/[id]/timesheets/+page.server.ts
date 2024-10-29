import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { validatePostTime } from '$lib/validation';
import { userCurrentEntries, postTime } from '$lib/server/data/time';
import type { TimeEntryRecord } from '$lib/types/schema';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) {
    redirect(302, '/login');
  }

  return {
    userTimsheet: await userCurrentEntries(locals.session)
  };
};

export const actions = {
  default: async ({
    request,
    locals,
    getClientAddress
  }): Promise<{ record: TimeEntryRecord | null } | { [key: string]: any }> => {
    if (!locals.user || !locals.session) {
      return fail(404, { message: 'User not found' });
    }
    const form = await request.formData();
    const validPost = validatePostTime.safeParse(Object.fromEntries(form));

    if (!validPost.success) {
      fail(400, { message: validPost.error.issues });
    }
    const { data: param } = validPost;
    const ipAddrss = getClientAddress();
    const userAgent = request.headers.get('user-agent') || '';

    if (param) {
      const { data, error } = await postTime({
        id: param.id || 0,
        user_id: locals.user.id,
        category: param.category,
        date_at: param.date_at,
        sched_id: param.sched_id,
        user_ip: ipAddrss,
        user_agent: userAgent,
        timestamp: Math.floor(Date.now() / 1000),
        timeAction: param.timeAction,
        remarks: param.remarks
      });

      if (error) {
        return fail(400, { message: error.message });
      }

      return {
        record: data
      };
    }

    return { record: null };
  }
} satisfies Actions;
