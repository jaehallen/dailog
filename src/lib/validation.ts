import { z, type ZodType } from 'zod';
import { CATEGORY, ACTIONSTATE, type ZPostTime } from './schema';

export const validateSignIn: ZodType<{ id: number; password: string }> = z.object({
	id: z.coerce.number().gte(100000).lte(999999),
	password: z.coerce.string().min(6)
});

export const validatePostTime: ZodType<ZPostTime> = z.object({
	id: z.coerce.number(),
	category: z.enum(CATEGORY),
	timeAction: z.enum(ACTIONSTATE),
	date_at: z.coerce.string().date()
});

export const validatePasswordReset: ZodType<{ oldPassword: string; newPassword: string }> = z.object({
	oldPassword: z.coerce.string().min(6),
	newPassword: z.coerce.string().min(6)
});

type ZPasswordReset = z.infer<typeof validatePasswordReset>