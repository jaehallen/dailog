import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.session) {
    return new Response(null, { status: 401 });
  }

  return {
    user: { ...locals.user },
    routeList: locals.routes
  };
};
