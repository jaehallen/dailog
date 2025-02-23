import { ROUTES, isProtectedRoute } from '$lib/permission';
import { lucia } from '$lib/server/lucia/auth';
import { error, redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

export const handleError: HandleServerError = async ({ error }) => {
  console.log(error);
  return {
    message: '🤯 Internal Server Error'
  };
};

export const auth: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get(lucia.sessionCookieName);

  if (event.url.pathname === '/') {
    redirect(302, '/login');
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

export const checkUser: Handle = async ({ event, resolve }) => {
  if (event.url.pathname !== '/login' && !event.locals.user) {
    redirect(302, '/login');
  }

  return resolve(event);
};

export const userRoute: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;
  const { user } = event.locals;

  if (isProtectedRoute(pathname)) {
    if (!user) {
      return error(405, 'Not Allowed');
    }

    const routeList = ROUTES
      .filter(route => route.isPermitted(user.role, user.region))
      .map(route => Object.assign({ name: route.name, path: route.path.replace('[id]', String(user.id)) }))

    if (!routeList.some((route) => route.path === pathname)) {
      return error(401, 'Unauthorized');
    }

    event.locals.routes = routeList;

  }
  return resolve(event);
};

export const handle: Handle = sequence(auth, checkUser, userRoute);
