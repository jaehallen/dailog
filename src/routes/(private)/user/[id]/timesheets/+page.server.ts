import type { PageServerLoad, Actions } from './$types';
import { lucia } from '$lib/server/lucia/auth';
import { fail, redirect } from '@sveltejs/kit';
import { validatePostTime, validateSignIn } from '$lib/validation';
import { validateUser } from '$lib/server/data/user';
import { userCurrentEntries, postTime } from '$lib/server/data/time';
import type { OptCategory, OptActionState, TimeEntryRecord, ZPostTime } from '$lib/schema';

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
		getClientAddress,
	}): Promise<{ record: TimeEntryRecord | null } | { [key: string]: any }> => {
		if (!locals.user || !locals.session) {
			return fail(404, { message: 'User not found' })
		}
		const form = await request.formData();
		const validPost = validatePostTime.safeParse(Object.fromEntries(form));


		if (!validPost.success) {
			fail(400, { message: validPost.error.issues });
		}
		const { data } = validPost;
		const ipAddrss = getClientAddress();
		const userAgent = request.headers.get('user-agent') || '';

		if (data) {
			const results = await postTime({
				id: data?.id || 0,
				user_id: locals.user.id,
				category: data?.category,
				date_at: data?.date_at,
				sched_id: locals.session.sched_id,
				user_ip: ipAddrss,
				user_agent: userAgent,
				timestamp: Math.floor(Date.now() / 1000),
				timeAction: data?.timeAction,
			})
		}

		if (locals.session) {
			return {
				record: {
					id: data?.id,
					end_at: Number(data?.id) ? Math.floor(Date.now() / 1000) : null,
					start_at: Math.floor(Date.now() / 1000),
					sched_id: locals.session.sched_id,
					date_at: locals.session.date_at,
					user_id: locals.user?.id,
					category: validPost.data?.category,
					elapse_sec: 0
				},
			};
		}

		return { record: null };
	}
} satisfies Actions;