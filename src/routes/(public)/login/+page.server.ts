import type { PageServerLoad, Actions } from './$types';
import type { DbResponse, UserRecord, SvelteFetch } from '$lib/types/schema';
import { lucia } from '$lib/server/lucia/auth';
import { fail, redirect } from '@sveltejs/kit';
import { validateSignIn } from '$lib/validation';
import { verifyPassword } from '$lib/server/lucia/hash-ish';
import { db } from '$lib/server/database/db-controller';


export const load: PageServerLoad = async ({ locals }) => {
  if (locals?.session) {
    redirect(302, `/user/${locals?.user?.id}/timesheets`);
  }

  return {};
};

export const actions = {
  default: async ({ cookies, request, fetch }) => {
    const form = await request.formData();
    const data: Record<string, any> = Object.fromEntries(form);
    const inputValid = validateSignIn.safeParse(data);

    if (!inputValid.success) {
      return fail(400, { message: inputValid.error.errors });
    }

    const { data: user, error } = await validateUser(fetch, inputValid.data);

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

async function validateUser(fetch: SvelteFetch, {
  id,
  password
}: {
  id: number;
  password: string;
}): Promise<DbResponse<(UserRecord & { sched_id: number }) | null>> {
  const { data, error } = await db.getUserValidation(id);

  if (error) {
    return { data: null, error };
  }

  if (!data || !data.active) {
    return { data: null };
  }

  const res = await verifyPassword(fetch, { password, password_hash: data.password_hash })

  if (!res.data || res.error) {
    return { data: null };
  }

  return { data };
}
