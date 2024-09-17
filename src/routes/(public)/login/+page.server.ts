import type { PageServerLoad, Actions } from './$types';
import { lucia } from '$lib/server/lucia/auth';
import { fail, redirect } from '@sveltejs/kit';
import { validateSignIn } from '$lib/validation';
import { validateUser } from '$lib/server/data/user';
import { tz } from '@date-fns/tz';
import { format } from 'date-fns';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals?.session) {
		redirect(302, `/user/${locals?.user?.id}/timesheets`);
	}

	const result = format(new Date(), 'MM/dd/yyyy hh:mm a');
	const resulttz = format(new Date(), 'MM/dd/yyyy', { in: tz('-05:00') });
	console.log(result);
	console.log(resulttz);

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

		const { user, schedule } = (await validateUser(inputValid.data)) || {};
		console.log(user, schedule);

		if (!user?.id) {
			return fail(400);
		}

		if (!schedule) {
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
