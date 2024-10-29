import { z, type ZodType } from 'zod';
import type { ZPostTime, ScheduleRecord } from './types/schema';
import { CATEGORY, ACTIONSTATE } from './defaults';

const TIMEREG = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const validateSignIn: ZodType<{ id: number; password: string }> = z.object({
  id: z.coerce.number().gte(100000).lte(999999),
  password: z.coerce.string().min(6)
});

export const validatePostTime: ZodType<ZPostTime> = z.object({
  id: z.coerce.number(),
  sched_id: z.coerce.number(),
  category: z.enum(CATEGORY),
  timeAction: z.enum(ACTIONSTATE),
  date_at: z.coerce.string().date(),
  remarks: z.coerce
    .string()
    .transform((v) => (v == '' ? null : v))
    .nullable()
});

export const validatePasswordReset: ZodType<{ oldPassword: string; newPassword: string }> =
  z.object({
    oldPassword: z.coerce.string().min(6),
    newPassword: z.coerce.string().min(6)
  });

export const validateSchedule: ZodType<Omit<ScheduleRecord, 'id'>> = z.object({
  user_id: z.coerce.number().gte(100000).lte(999999),
  effective_date: z.coerce.string().date(),
  utc_offset: z.coerce.number().gte(-12).lte(14),
  local_offset: z.coerce.number().gte(-12).lte(14),
  clock_at: z.coerce.string().regex(TIMEREG),
  first_break_at: z.coerce.string().regex(TIMEREG),
  lunch_at: z.coerce.string().regex(TIMEREG),
  second_break_at: z.coerce.string().regex(TIMEREG),
  work_dur_min: z.coerce.number().gte(60).optional(),
  lunch_dur_min: z.coerce.number().gte(60).optional(),
  break_dur_min: z.coerce.number().gte(60).optional(),
  day_off: z.coerce.string()
});

export const validateUser = z.object({
  id: z.coerce.number().gte(100000).lte(999999),
  name: z.coerce.string(),
  lead_id: z.coerce.number().gte(100000).lte(999999),
  region: z.coerce.string(),
  role: z.enum(['admin', 'lead', 'poc', 'user']),
  active: z.coerce.number().transform(Boolean),
  lock_password: z.coerce.number().transform(Boolean)
});

export const validateRegistration = z.object({
  id: z.coerce.number().gte(100000).lte(999999), 
  lead_id: z.coerce.number().gte(100000).lte(999999),
  name: z.coerce.string().min(2),
  region: z.coerce.string().min(2)
})

export const validateSearch = z.object({
  limit: z.coerce.number().gt(0),
  last_id: z.coerce.number().gte(0),
  lead_id: z
    .string()
    .transform((v) => (isNaN(parseInt(v)) ? null : parseInt(v)))
    .pipe(z.number().nullable()),
  active: z
    .string()
    .transform((v) => (isNaN(parseInt(v)) ? null : parseInt(v)))
    .pipe(z.number().nullable()),
  search: z.coerce
    .string()
    .transform((v) => (v == '' ? null : v))
    .nullable(),
  region: z.coerce
    .string()
    .transform((v) => (v == '' ? null : v))
    .nullable(),
  page_index: z.coerce
    .string()
    .transform((v) => (v == '' ? null : v))
    .nullable(),
  page_total: z.coerce
    .string()
    .transform((v) => (isNaN(parseInt(v)) ? null : parseInt(v)))
    .pipe(z.number().nullable()),
});

export type SearchOptions = z.infer<typeof validateSearch> & {
  [key: string]: string | number | null;
};

