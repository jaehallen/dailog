import type { PageServerLoad, Actions } from './$types';
import { lucia } from '$lib/server/lucia/auth';
import { fail, redirect } from '@sveltejs/kit';
import { validateSignIn } from '$lib/validation';
import { AppPass } from '$lib/server/lucia/hash-ish';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/database/db-controller';
import type { DbResponse, UserRecord } from '$lib/types/schema';

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
    const inputValid = validateSignIn.safeParse(data);

    if (!inputValid.success) {
      return fail(400);
    }

    const { data: user, error } = await validateUser(inputValid.data);

    if (error) {
      return fail(420, { message: error.message });
    }

    if (!user) {
      return fail(400);
    }

    if (!user.sched_id) {
      return fail(400, { noSchedule: true });
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });

    redirect(302, `/user/${user.id}/timesheets`);
  }
} satisfies Actions;

async function validateUser({
  id,
  password
}: {
  id: number;
  password: string;
}): Promise<DbResponse<(UserRecord & { sched_id: number }) | null>> {
  const appPass = new AppPass(undefined, { iterations: Number(env.ITERATIONS) });
  const { data, error } = await db.getUserValidation(id);

  if (error) {
    return { data: null, error };
  }

  if (!data || !data.active) {
    return { data: null };
  }

  if (!(await appPass.verify(data.password_hash, password))) {
    return { data: null };
  }

  return { data };
}
