import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { validatePasswordReset, validatePreference } from '$lib/validation';
import { db } from '$lib/server/database/db-controller';
import { hashPassword, verifyPassword } from '$lib/server/lucia/hash-ish';
import type { SvelteFetch } from '$lib/types/schema';

export const load = (async ({ locals }) => {
  if (!locals.user) {
    redirect(302, '/login');
  }

  return await db.getUserProfile(locals.user.id, 20);
}) satisfies PageServerLoad;

export const actions = {
  'password-reset': async ({ request, locals, fetch }) => {
    if (!locals.user) {
      redirect(302, '/login');
    }
    const form = await request.formData();
    const valid = validatePasswordReset.safeParse({
      oldPassword: form.get('old'),
      newPassword: form.get('new')
    });

    if (!valid.success) {
      return fail(400, { invalidInputs: true });
    }

    const response = await userPasswordReset(fetch, locals.user.id, valid.data);

    if (!response?.success) {
      return fail(400, { ...response });
    }

    return response;
  },
  'update-preferences': async ({ request, locals }) => {
    if (!locals.user) {
      redirect(302, '/login');
    }

    const form = await request.formData();
    const valid = validatePreference.safeParse(Object.fromEntries(form));

    if (!valid.success) {
      return fail(400, { message: valid.error.errors });
    }

    if (!valid.data) {
      return fail(400, { message: 'No Data' });
    }

    const { data, error } = await db.updateUserPreference(locals.user.id, valid.data);

    if (error) {
      return fail(401, { message: error.message });
    }

    return { preference: data };
  }
} satisfies Actions;

async function userPasswordReset(
  fetch: SvelteFetch,
  userId: number,
  { oldPassword, newPassword }: { oldPassword: string; newPassword: string }
): Promise<{ incorrect?: boolean; locked?: boolean; success?: boolean } | null> {
  const { data: user, error: err } = await db.getUser(userId);

  if (!user || err) {
    return null;
  }

  const verifiedData = await verifyPassword(fetch, {
    password: oldPassword,
    password_hash: user.password_hash
  });

  if (!verifiedData.data) {
    return {
      incorrect: true
    };
  }

  if (user.lock_password) {
    return {
      locked: true
    };
  }

  const hashData = await hashPassword(fetch, newPassword);

  if (!hashData.data || hashData.error) {
    return {
      success: false
    };
  }

  const { data, error } = await db.updatePassword(userId, hashData.data);

  if (error) {
    return {
      success: false
    };
  }

  return {
    success: data
  };
}
