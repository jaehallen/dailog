import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lucia } from '$lib/server/lucia/auth';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (!locals.session) {
		return new Response(null, { status: 401 });
	}

	await lucia.invalidateSession(locals.session.id);
	const sessionCookie = lucia.createBlankSessionCookie();
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});

	redirect(302, '/login');
};

