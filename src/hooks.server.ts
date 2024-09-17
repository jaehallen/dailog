import { lucia } from '$lib/server/lucia/auth';
import { routeProfile } from '$lib/utility';
import { error, redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

export const handleError: HandleServerError = async ({ error }) => {
	console.log(error);
	return {
		message: '🤯 Noooooooo'
	};
};

export const auth: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	
	if(event.url.pathname === '/'){
		redirect(302, '/login')
	}

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const userRoute: Handle = async ({ event, resolve }) => {
	if (event.locals.user) {
		const routeList = routeProfile(event.locals.user);

		if (!routeList.length) {
			return error(405, 'Not Allowed');
		}

		event.locals.routes = routeList;
	}

	return resolve(event);
};


export const handle: Handle = sequence(auth, userRoute);
