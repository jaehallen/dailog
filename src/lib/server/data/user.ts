import { Argon2id } from "oslo/password";
import { db } from "../database/db-controller"

export const validateUser = async ({id, password}: {id: number, password: string}) => {
  const argon2id = new Argon2id();
  const {user, schedule, timeEntries} = await db.getInitInfo(id) || {};
  if(!user || !user.active){
    return null
  }

  const validPassword = await argon2id.verify(user.password_hash, password);

  if(!validPassword){
    return null
  }

  return {user, schedule, timeEntries}
}
