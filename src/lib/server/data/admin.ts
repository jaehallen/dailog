import type { User } from 'lucia';
import { db } from '$lib/server/database/db-controller';
import type { UsersList } from '$lib/types/schema';
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

function toUsersList(record: Record<string, any>): UsersList {
  const { id, active, name, region, role, lead_id, teamlead, lock_password, schedules } = record;

  const sched = parseJSON(schedules);
  const currentSched = getCurrentSchedule(sched);
  console.log(currentSched);

  return {
    id,
    name,
    region,
    role,
    lead_id,
    teamlead,
    active: Boolean(active),
    lock_password: Boolean(lock_password),
    latest_schedule: currentSched?.effective_date ?? null,
    schedules: sched
  };
}
