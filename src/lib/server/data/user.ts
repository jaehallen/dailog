import { AppPass } from '$lib/server/lucia/hash-ish';
import { db } from '../database/db-controller';
import type { ScheduleRecord, UserProfile } from '$lib/schema';
import {env} from "$env/dynamic/private"

export const validateUser = async ({ id, password }: { id: number; password: string }) => {
	const appPass = new AppPass(undefined, {iterations: Number(env.ITERATIONS)});
	const { user = null, schedules = [] } = (await db.getUserLatestInfo(id)) || {};

	if (!user || !user.active) {
		return { user: null, schedule: null };
	}

	if (!(await appPass.verify(user.password_hash, password))) {
		return { user: null, schedule: null };
	}

	return { user, schedule: schedules.length ? schedules : null };
};

export function getUserProfile(
	userId: number,
	schedule_count: number
): Promise<{ user: UserProfile | null; schedules: ScheduleRecord[] }> {
	return db.getUserProfile(userId, schedule_count);
}

export async function userPasswordReset(
	userId: number,
	{ oldPassword, newPassword }: { oldPassword: string; newPassword: string }
): Promise<{ incorrect?: boolean; locked?: boolean; success?: boolean } | null> {
	const user = await db.getUser(userId);

	if (!user) {
		return null;
	}

	const appPass = new AppPass(undefined, {iterations: Number(env.ITERATIONS)});
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
	const success = await db.updatePassword(userId, hash);

	return {
		success: Boolean(success)
	};
}
