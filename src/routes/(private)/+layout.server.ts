import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { userInitials } from '$lib/utility';

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    userInitial: locals.user ? userInitials(locals.user?.name) : 'Dailog',
    routeList: locals.routes
  };
};
