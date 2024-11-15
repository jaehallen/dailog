import type { User } from 'lucia';
import type { DbResponse, ScheduleRecord, UserRecord, UsersList } from '$lib/types/schema';
import { db } from '$lib/server/database/db-controller';
import { parseJSON } from '$lib/utility';
import {isAdmin, isEditor, } from '$lib/permission';
import { getCurrentSchedule } from './schedule';
import { validateSearch, type SearchOptions } from '$lib/validation';
import { TEMPID } from '$lib/defaults';
import { AppPass } from '../lucia/hash-ish';
import { env } from '$env/dynamic/private';

export const listOfUsers = async (options: SearchOptions): Promise<DbResponse<UsersList[]>> => {
  const { data, error } = await db.getManyUsers(options);
  if (error) {
    return { data: null, error };
  }
  return { data: data.rows.map(toUsersList) };
};

export const searchUsers = async (options: SearchOptions): Promise<DbResponse<UsersList[]>> => {
  const { data, error } = await db.searchUsers(options);
  if (error) {
    return { data: null, error };
  }

  return { data: data.rows.map(toUsersList) };
};

export const insertUser = async (args: Pick<UserRecord, 'id' | 'name' | 'lead_id' | 'region'>) => {
  const appPass = new AppPass(undefined, { iterations: Number(env.ITERATIONS) });
  const password_hash = await appPass.hash(`${args.id}@${args.region.toLowerCase()}`);
  return db.createUser({ ...args, password_hash });
};

export const reDefaultPassword = async (
  args: Omit<UserRecord, 'password_hash' | 'preferences'>
) => {
  const appPass = new AppPass(undefined, { iterations: Number(env.ITERATIONS) });
  const password_hash = await appPass.hash(`${args.id}@${args.region.toLowerCase()}`);
  return db.updatePassword(args.id, password_hash);
};

export const addUserSchedule = async (args: Omit<ScheduleRecord, 'id'>) => {
  return db.createUserSchedule(args);
};

export const addManySchedule = async (
  args: Omit<ScheduleRecord, 'id' | 'user_id'> & { ids_list: number[] }
) => {
  const { ids_list, ...scheds } = args;
  const values = ids_list.map((user_id) => Object.assign({ ...scheds, user_id }));
  return db.createManySchedule(values);
};

export const updateUser = async (user: Omit<UserRecord, 'password_hash' | 'preferences'>) => {
  return db.updateUser(user);
};

export const userFilters = (user: User, query: URLSearchParams): SearchOptions => {
  let lastId = Number(query.get('last_id')) || 0;
  if (isEditor(user.role) && user.id > TEMPID && lastId < TEMPID) {
    lastId = TEMPID;
  }
  const defaultSearch: SearchOptions = isAdmin(user.role)
    ? {
        search: '',
        active: null,
        limit: 100,
        region: null,
        lead_id: null,
        last_id: lastId,
        page_total: null,
        page_index: String(lastId)
      }
    : {
        search: '',
        active: 1,
        limit: 100,
        region: user.region,
        lead_id: null,
        last_id: TEMPID,
        page_total: null,
        page_index: String(TEMPID)
      };

  if (query.size) {
    const temp = {
      search: '',
      active: query.get('active'),
      limit: Number(query.get('limit')),
      region: query.get('region'),
      lead_id: query.get('lead_id'),
      last_id: lastId,
      page_total: Number(query.get('page_total')),
      page_index: query.get('page_index')
    };

    const zSearch = validateSearch.safeParse(temp);
    return zSearch.success ? zSearch.data : defaultSearch;
  }

  return defaultSearch;
};

function toUsersList(record: Record<string, any>): UsersList {
  const {
    id,
    active,
    name,
    region,
    role,
    lead_id,
    teamlead,
    lock_password,
    schedules,
    created_at,
    updated_at
  } = record;

  const sched = parseJSON(schedules);
  const currentSched = getCurrentSchedule(sched);

  return {
    id,
    name,
    region,
    role,
    lead_id,
    teamlead,
    active: Boolean(active),
    lock_password: Boolean(lock_password),
    created_at,
    updated_at,
    latest_schedule: currentSched?.effective_date ?? null,
    schedules: sched
  };
}
