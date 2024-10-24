import type { User } from 'lucia';
import { db } from '$lib/server/database/db-controller';
import type { ScheduleRecord, UserRecord, UsersList } from '$lib/types/schema';
import { isAdmin, isLepo, parseJSON } from '$lib/utility';
import { getCurrentSchedule } from './schedule';
import type { SearchOptions } from '$lib/validation';
import { TEMPID } from '$lib/defaults';

export const listOfUsers = async (options: SearchOptions): Promise<UsersList[]> => {
  const usersList = await db.getManyUsers(options);
  return usersList.map(toUsersList);
};

export const addUserSchedule = async (args: Omit<ScheduleRecord, 'id'>) => {
  return db.createUserSchedule(args);
};

export const updateUser = async (user: Omit<UserRecord, 'password_hash' | 'preferences'>) => {
  return db.updateUser(user);
};

export const userFilters = (user: User, query: URLSearchParams): SearchOptions => {
  if (query.size) {
    const temp = {
      username: query.get('username') ?? '',
      active: Number(query.get('active')) ?? null,
      limit: Number(query.get('limit')) ?? 100,
      region: query.get('region') ?? null,
      lead_id: Number(query.get('lead_id')) ?? null,
      last_id: Number(query.get('last_id')) ?? 0
    };

    if (!isLepo(user.role) && temp.last_id <= TEMPID) {
      temp.last_id = TEMPID;
    }

    return temp;
  } else if (isAdmin(user.role)) {
    return {
      username: '',
      active: null,
      limit: 100,
      region: null,
      lead_id: null,
      last_id: 0
    };
  }

  return {
    username: '',
    active: 1,
    limit: 100,
    region: user.region,
    lead_id: user.id,
    last_id: TEMPID
  };
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
