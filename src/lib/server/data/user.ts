import { AppPass } from '$lib/server/lucia/hash-ish';
import { db } from '$lib/server/database/db-controller';
import type { DbResponse, ScheduleRecord, UserProfile, UserRecord } from '$lib/types/schema';
import { env } from '$env/dynamic/private';

const validateUser = async ({
  id,
  password
}: {
  id: number;
  password: string;
}): Promise<DbResponse<(UserRecord & { sched_id: number }) | null>> => {
  const appPass = new AppPass(undefined, { iterations: Number(env.ITERATIONS) });
  const { data, error } = await db.getUserValidation(id);

  if (error) {
    return { data: null, error };
  }

  if (!data || !data.active) {
    return { data: null };
  }

  if (!(await appPass.verify(data.password_hash, password))) {
    return { data: null };
  }

  return { data };
};

async function getUserProfile(
  userId: number,
  schedule_count: number
): Promise<{ user: UserProfile | null; schedules: ScheduleRecord[] }> {
  return db.getUserProfile(userId, schedule_count);
}

async function userPasswordReset(
  userId: number,
  { oldPassword, newPassword }: { oldPassword: string; newPassword: string }
): Promise<{ incorrect?: boolean; locked?: boolean; success?: boolean } | null> {
  const { data: user, error: err } = await db.getUser(userId);

  if (!user || err) {
    return null;
  }

  const appPass = new AppPass(undefined, { iterations: Number(env.ITERATIONS) });
  if (!(await appPass.verify(user.password_hash, oldPassword))) {
    return {
      incorrect: true
    };
  }

  if (user.lock_password) {
    return {
      locked: true
    };
  }
  const hash = await appPass.hash(newPassword);
  const { data, error } = await db.updatePassword(userId, hash);

  if (error) {
    return {
      success: false
    };
  }

  return {
    success: data
  };
}
