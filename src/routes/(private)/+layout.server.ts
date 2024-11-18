import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/database/db-controller';
import { isAdmin, isViewer } from '$lib/permission';
import { fail } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.session) {
    return new Response(null, { status: 401 });
  }

  let defaultOptions = null;
  if (url.pathname.includes('admin')) {
    if (locals.user) {
      const { id, role, region } = locals.user;
      if (isViewer(role)) {
        defaultOptions = await db.getAdmninInitData({ id, role, region });
      } else {
        return fail(401, { message: "User not authorized" })
      }

      if(!isAdmin(role) && defaultOptions.regions.length){
        defaultOptions.regions = [region]
      }
    }
  }

  return {
    user: locals.user,
    session: locals.session,
    routeList: locals.routes,
    defaultOptions
  };
};
