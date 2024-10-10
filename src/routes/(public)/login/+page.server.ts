import type { PageServerLoad, Actions } from './$types';
import { lucia } from '$lib/server/lucia/auth';
import { fail, redirect } from '@sveltejs/kit';
import { validateSignIn } from '$lib/validation';
import { validateUser } from '$lib/server/data/user';
import { elapseTime } from '$lib/utility';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals?.session) {
    redirect(302, `/user/${locals?.user?.id}/timesheets`);
  }

  return {};
};

export const actions = {
  default: async ({ cookies, request }) => {
    const form = await request.formData();
    const data: Record<string, any> = Object.fromEntries(form);
    elapseTime('Login Zod Start')
    const inputValid = validateSignIn.safeParse(data);
    elapseTime('Login Zod End')
    if (!inputValid.success) {
      return fail(400);
    }

    elapseTime("db validation start")
    const user = await validateUser(inputValid.data);
    elapseTime("db validation end")

    if (!user) {
      return fail(400);
    }

    if (!user.sched_id) {
      return fail(400, { noSchedule: true });
    }

    elapseTime('start session')
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });
    elapseTime('end session')
    redirect(302, `/user/${user.id}/timesheets`);
  }
} satisfies Actions;
