import type { User } from "lucia";
import { db } from "$lib/server/database/db-controller";
import type { UsersList } from "$lib/schema";

export const listOfUsers = async (user: User, options: {
  lead_id?: number;
  region?: string;
  active?: number;
  offset?: number;
  limit?: number;
} = {}): Promise<UsersList[]> => {
  const usersList = await db.getManyUsers(options);
  return usersList.map(toUsersList);
}

function toUsersList(record: Record<string, any>): UsersList {
  const { id, active, name, region, role, lead_id, teamlead, lock_password, latest_schedule, total_schedule } =
    record;

  return {
    id,
    name,
    region,
    role,
    lead_id,
    teamlead,
    active: Boolean(active),
    lock_password: Boolean(lock_password),
    latest_schedule,
    total_schedule
  };
}