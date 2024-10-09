import type { User } from "lucia";
import { db } from "../database/db-controller";
import type { UserRecord } from "$lib/schema";

export const userLists= async(user: User): Promise<UserRecord[]> => {
    const usersList = await db.getUsersList({active:1});
    return usersList
}