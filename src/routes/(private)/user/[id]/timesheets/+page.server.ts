import type { PageServerLoad, Actions } from './$types';
import { lucia } from '$lib/server/lucia/auth';
import { fail, redirect } from '@sveltejs/kit';
import { validateSignIn } from '$lib/validation';
import { validateUser } from '$lib/server/data/user';
import { userCurrentEntries } from '$lib/server/data/time';
import type { OptCategory, OptActionState, TimeEntryRecord } from '$lib/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		redirect(302, '/login');
	}

	const userTimsheet = await userCurrentEntries(locals.session);

	console.log('timesheet loading');
	return {
		userTimsheet
	};
};

export const actions = {
	default: async ({
		request,
		locals
	}): Promise<{ record: Partial<TimeEntryRecord>; [key: string]: any }> => {
		const form = await request.formData();
		const data = Object.fromEntries(form);
		const category = data.category as OptCategory;
		const timeAction = data.timeAction as OptActionState;
		console.log(data);

		const id = !Number(data.id) ? Math.floor(Math.random() * 100) : Number(data.id);

		if (locals.session) {
			return {
				record: {
					id,
					end_at: Number(data.id) ? Math.floor(Date.now() / 1000) : null,
					start_at: Math.floor(Date.now() / 1000),
					sched_id: locals.session.sched_id,
					date_at: locals.session.date_at,
					user_id: locals.user?.id,
					category,
					elapse_sec: 0
				},
				timeAction
			};
		}

		return { record: {} };
	}
} satisfies Actions;
