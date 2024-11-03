import type { PageServerLoad, Actions } from './$types';
import type { TimeEntryRecord, ZPostTime } from '$lib/types/schema';
import { fail, redirect } from '@sveltejs/kit';
import { validatePostTime } from '$lib/validation';
import { db } from '$lib/server/database/db-controller';
import { getSchedule } from '$lib/server/data/schedule';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session || !locals.user) {
    redirect(302, '/login');
  }

  const { schedules, timeEntries } = await db.getUserEntryAndSched(locals.user.id);

  return {
    userTimsheet: {
      timeEntries,
      schedule: getSchedule(schedules, timeEntries)
    }
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

    const ipAddrss = getClientAddress();
    const userAgent = request.headers.get('user-agent') || '';

    if (validPost.data) {
      const { data, error } = await postTime(locals.user.id, {
        ...validPost.data,
        user_ip: ipAddrss,
        user_agent: userAgent
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

async function postTime(id: number, data: ZPostTime & { user_ip: string; user_agent: string }) {
  const timestamp = Math.floor(Date.now() / 1000);
  if (data.timeAction == 'start') {
    return await db.startTime({
      user_id: id,
      category: data.category,
      date_at: data.date_at,
      sched_id: data.sched_id,
      start_at: timestamp,
      user_ip: data.user_ip,
      user_agent: data.user_agent,
      remarks: data.remarks
    });
  } else {
    return await db.endTime({
      id: data.id,
      end_at: timestamp,
      user_ip: data.user_ip,
      user_agent: data.user_agent,
      remarks: data.remarks
    });
  }
}
