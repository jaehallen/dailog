import type { PageServerLoad } from './$types';
import { validateUser } from '$lib/server/data/user';

export const load = (async ({locals}) => {
    if(locals.user){
		const results = await validateUser({id: locals.user.id, password: 'admin@hopkins'});
		console.log(results)
	}

    return {};
}) satisfies PageServerLoad;