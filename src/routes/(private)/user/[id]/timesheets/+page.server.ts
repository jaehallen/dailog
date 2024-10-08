import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { validatePostTime } from '$lib/validation';
import { userCurrentEntries, postTime } from '$lib/server/data/time';
import type { TimeEntryRecord } from '$lib/schema';


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
		const { data } = validPost;
		const ipAddrss = getClientAddress();
		const userAgent = request.headers.get('user-agent') || '';

		if (data) {
			return {
				record: await postTime({
					id: data?.id || 0,
					user_id: locals.user.id,
					category: data?.category,
					date_at: data?.date_at,
					sched_id: data?.sched_id,
					user_ip: ipAddrss,
					user_agent: userAgent,
					timestamp: Math.floor(Date.now() / 1000),
					timeAction: data?.timeAction,
					remarks: data.remarks
				})
			};
		}

		return { record: null };
	}
} satisfies Actions;
