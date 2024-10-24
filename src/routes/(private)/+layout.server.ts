import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/database/db-controller';
import { isEditor } from '$lib/utility';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.session) {
    return new Response(null, { status: 401 });
  }
  let defaultOptions = null;
  if (url.pathname.includes('admin')) {
    if (locals.user) {
      const { id, name, role, region } = locals.user;
      if (isEditor(role)) {
        defaultOptions = await db.getAdmninInitData(role);
      }

      if (defaultOptions && !defaultOptions.leads.find(l => l.id === id)) {
        defaultOptions.leads.push({ id, name, region })
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
