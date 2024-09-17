import { Argon2id } from "oslo/password";
import { db } from "../database/db-controller"
import type { ScheduleRecord, UserCurrentInfo } from "../database/schema";
import { date } from "zod";
import { dateAtOffset } from "$lib/utility";

export const validateUser = async ({ id, password }: { id: number, password: string })  => {
    const argon2id = new Argon2id();
    const { user = null, schedules = [], timeEntries = null } = await db.getUserLatestInfo(id) || {};
    if (!user || !user.active) {
        return null
    }

    if(await argon2id.verify(user.password_hash, password)){
        return null
    };

    const schedule = getCurrentSchedule(schedules || [])

    return { user, schedule, timeEntry: timeEntries }
}

function getCurrentSchedule(schedules: ScheduleRecord[] = []) {
    const today = new Date();
    schedules.sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime());

    const currentSchedule = schedules.find(schedule => {
        const scheduleDate = new Date(schedule.effective_date);
        const todayOffset = dateAtOffset(scheduleDate, schedule.utc_offset);
        todayOffset >= scheduleDate
    });

    return currentSchedule;
}