import type { User } from 'lucia';
import { db } from '$lib/server/database/db-controller';
import type { ScheduleRecord, UserRecord, UsersList } from '$lib/types/schema';
import { isAdmin, parseJSON } from '$lib/utility';
import { getCurrentSchedule } from './schedule';
import { validateSearch, type SearchOptions } from '$lib/validation';
import { TEMPID } from '$lib/defaults';

export const listOfUsers = async (options: SearchOptions, isPrev = false): Promise<UsersList[]> => {
  const usersList = await db.getManyUsers(options, isPrev);
  return usersList.map(toUsersList);
};

export const addUserSchedule = async (args: Omit<ScheduleRecord, 'id'>) => {
  return db.createUserSchedule(args);
};

export const updateUser = async (user: Omit<UserRecord, 'password_hash' | 'preferences'>) => {
  return db.updateUser(user);
};

export const userFilters = (user: User, query: URLSearchParams): SearchOptions => {
  const defaultSearch: SearchOptions = isAdmin(user.role)
    ? {
        username: '',
        active: null,
        limit: 100,
        region: null,
        lead_id: null,
        last_id: 0,
        page_total: null,
        page_index: String(0),
      }
    : {
        username: '',
        active: 1,
        limit: 100,
        region: user.region,
        lead_id: user.id,
        last_id: TEMPID,
        page_total: null,
        page_index: String(TEMPID)
      };

  if (query.size) {
    const temp = {
      username: query.get('username'),
      active: query.get('active'),
      limit: Number(query.get('limit')),
      region: query.get('region'),
      lead_id: query.get('lead_id'),
      last_id: Number(query.get('last_id')),
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
