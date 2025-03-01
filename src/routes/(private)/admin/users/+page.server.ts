import type { PageServerLoad, Actions } from './$types';
import type { ValidUserFields } from '$lib/validation';
import { redirect, fail } from '@sveltejs/kit';
import {
  validateSchedule,
  validateUser,
  validateSearch,
  validateManySched,
  validateBatchUser,
} from '$lib/validation';
import { isAdmin, isEditor, isScheduler } from '$lib/permission';
import { TEMPID } from '$lib/defaults';
import { db } from '$lib/server/database/db-controller';
import {
  listOfUsers,
  reDefaultPassword,
  searchUsers,
  updateUser,
  userFilters
} from '$lib/server/data/admin';

export const load = (async ({ locals, url }) => {
  if (!locals.user) {
    redirect(302, '/login');
  }

  if (!isScheduler(locals.user.role)) {
    redirect(302, '/');
  }

  const filterOptions = userFilters(locals.user, url.searchParams);
  const { data, error } = await listOfUsers(filterOptions);

  return {
    queries: filterOptions,
    listOfUsers: data ?? [],
    error
  };
}) satisfies PageServerLoad;

export const actions = {
  filter: async ({ locals, request }) => {
    if (!locals.user) {
      return fail(404, { message: 'User not found' });
    }
    const admin = isAdmin(locals.user.role);
    const form = await request.formData();

    form.set('page_total', '');
    form.set('page_index', '');
    form.set('last_id', admin && locals.user.id < TEMPID ? '0' : TEMPID.toString());

    if (!admin) {
      form.set('region', locals.user.region);
    }
    return await queryData(form, admin);
  },

  'prev-page': async ({ request, locals }) => {
    if (!locals.user) {
      return fail(404, { message: 'User not found' });
    }
    const form = await request.formData();
    const lastId = Number(form.get('last_id'));

    if (!isAdmin(locals.user.role) && locals.user.id > TEMPID && lastId < TEMPID) {
      form.set('last_id', String(TEMPID))
    }

    if (!isAdmin(locals.user.role)) {
      form.set('region', locals.user.region);
    }

    return await queryData(form);
  },
  'next-page': async ({ request, locals }) => {
    if (!locals.user) {
      return fail(404, { message: 'User not found' });
    }
    const form = await request.formData();
    if (!isAdmin(locals.user.role)) {
      form.set('region', locals.user.region);
    }
    return await queryData(form);
  },
  'select-page': async ({locals, request, url}) => {
    if (!locals.user) {
      return fail(404, { message: 'User not found' });
    }

    const lastId = Number(url.searchParams.get('last_id') || '');
    const form = await request.formData();

    if (!isAdmin(locals.user.role) && locals.user.id > TEMPID && lastId < TEMPID) {
      form.set('last_id', String(TEMPID))
    }else{
      form.set('last_id', String(lastId))
    }
    if (!isAdmin(locals.user.role)) {
      form.set('region', locals.user.region);
    }
    return await queryData(form);
  },

  'add-schedule': async ({ request, locals }) => {
    if (!locals.user || !locals.session) {
      return fail(404, { message: 'User not found' });
    }

    if (!isScheduler(locals.user.role)) {
      return fail(401, { message: 'User not authorized' });
    }

    const form = await request.formData();
    const validSched = validateSchedule.safeParse(Object.fromEntries(form));

    if (!validSched.success) {
      return fail(404, { message: validSched.error.errors });
    }

    const { data, error } = await db.createUserSchedule(validSched.data);

    if (error) {
      return fail(404, { message: error.message });
    }

    return {
      schedule: data
    };
  },

  'add-many-schedule': async ({ request, locals }) => {
    if (!locals.user || !locals.session) {
      return fail(404, { message: 'User not found' });
    }

    if (!isScheduler(locals.user.role)) {
      return fail(401, { message: 'User not authorized' });
    }
    const form = await request.formData();
    const validSched = validateManySched.safeParse(Object.fromEntries(form));

    if (!validSched.success) {
      return fail(404, { message: validSched.error.errors });
    }

    const { ids_list, ...scheds } = validSched.data;
    const values = ids_list.map((user_id) => Object.assign({ ...scheds, user_id }));
    const { data, error } = await db.createManySchedule(values);

    if (error) {
      return fail(404, { message: error.message });
    }

    return {
      listOfSchedules: data
    };
  },
  'update-many-user': async ({ request, locals }) => {
    if (!locals.user || !locals.session) {
      return fail(404, { message: 'User not found' });
    }

    if (!isEditor(locals.user.role)) {
      return fail(401, { message: 'User not authorized' });
    }

    const form = await request.formData();
    const validInfo = validateBatchUser.safeParse(Object.fromEntries(form));

    if (!validInfo.success) {
      return fail(401, { message: validInfo.error.errors });
    }

    const { ids_list, ...info } = validInfo.data;
    const temp = Object.entries(info).filter(([_, v]) => v !== null);

    if (!temp.length) {
      return fail(401, { message: 'No value to set' });
    }
    const infoVal = Object.fromEntries(temp);
    const values = ids_list.map((id) => Object.assign({ ...infoVal, id }));
    const { data, error } = await db.updateManyUser(values);

    if (error) {
      return fail(401, { message: error.message });
    }

    return {
      listOfUsers: data
    };
  },
  'update-user': async ({ request, locals }) => {
    if (!locals.user || !locals.session) {
      return fail(404, { message: 'User not found' });
    }

    if (!isEditor(locals.user.role)) {
      return fail(401, { message: 'User not authorized' });
    }

    const form = await request.formData();

    const validUserInput = validateFieldToUpdate(form);

    if (!validUserInput.success) {
      return fail(401, { message: validUserInput.error.errors });
    }

    if (Object.keys(validUserInput.data).length < 2) {
      return fail(401, { message: "No value to update" })
    }

    if (!isAdmin(locals.user.role) && validUserInput.data.role && isScheduler(validUserInput.data.role)) {
      return fail(401, { message: 'User not authorized' })
    }

    const { data, error } = await updateUser(validUserInput.data);

    if (error) {
      return fail(404, { message: error.message });
    }

    const { password_hash, preferences, ...user } = data;

    return {
      user
    };
  },
  'password-reset': async ({ request, locals, fetch }) => {
    if (!locals.user || !locals.session) {
      return fail(404, { message: 'User not found' });
    }

    if (!isAdmin(locals.user.role)) {
      return fail(401, { message: 'User not authorized' });
    }

    const form = await request.formData();
    const validUser = validateUser.safeParse(Object.fromEntries(form));

    if (!validUser.success) {
      return fail(404, { message: validUser.error.errors });
    }

    const { data, error } = await reDefaultPassword(fetch, validUser.data);
    if (error) {
      return fail(404, { message: error.message });
    }

    return {
      success: data
    };
  }
} satisfies Actions;

async function queryData(form: FormData, admin?: boolean) {
  const validFilter = validateSearch.safeParse(Object.fromEntries(form));

  if (!validFilter.success) {
    return fail(401, { message: 'Invalid Filter' });
  }

  if (validFilter.data.search) {
    // if (admin) {
    //   validFilter.data.region = null;
    // }

    const { data, error } = await searchUsers(validFilter.data);
    return {
      queries: { ...validFilter.data },
      listOfUsers: data,
      error
    };
  }

  const { data, error } = await listOfUsers(validFilter.data);

  return {
    queries: { ...validFilter.data },
    listOfUsers: data,
    error
  };
}

function validateFieldToUpdate(form: FormData) {
  const fields = String(form.get('fields')).split("|");
  const fieldEntries = Object.fromEntries(fields.map((f) => [f, true])) as { [key in keyof ValidUserFields]: true | undefined }

  const validateFields = validateUser.pick(fieldEntries)
  return validateFields.safeParse(Object.fromEntries(form))
}