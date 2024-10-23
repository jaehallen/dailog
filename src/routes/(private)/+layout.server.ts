import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/database/db-controller';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.session) {
    return new Response(null, { status: 401 });
  }

  return {
    user: locals.user,
    routeList: locals.routes,
    defaultOptions:
      locals.user && url.pathname.includes('admin')
        ? await db.getAdmninInitData(locals.user.role)
        : null
  };
};
