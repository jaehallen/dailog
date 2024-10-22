import type { User } from 'lucia';
import { db } from '$lib/server/database/db-controller';
import type { ScheduleRecord, UserRecord, UsersList } from '$lib/types/schema';
import { parseJSON } from '$lib/utility';
import { getCurrentSchedule } from './schedule';

export const listOfUsers = async (
  user: User,
  options: {
    lead_id?: number;
    region?: string;
    active?: number;
    offset?: number;
    limit?: number;
  } = {}
): Promise<UsersList[]> => {
  const usersList = await db.getManyUsers(options);
  return usersList.map(toUsersList);
};

export const addUserSchedule = async (args: Omit<ScheduleRecord, "id">) => {
  return db.createUserSchedule(args);
};

export const updateUser = async (user: Omit<UserRecord, "password_hash" | "preferences">) => {
  return db.updateUser(user);
};

function toUsersList(record: Record<string, any>): UsersList {
  const { id, active, name, region, role, lead_id, teamlead, lock_password, schedules, created_at, updated_at } = record;

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
