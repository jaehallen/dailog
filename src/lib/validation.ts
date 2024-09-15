import { z, type ZodType } from 'zod';

export const validateSignIn: ZodType<{ id: number; password: string }> = z.object({
	id: z.coerce.number().gte(100000).lte(999999),
	password: z.coerce.string().min(6)
});
