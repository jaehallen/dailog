import { LIMIT, TEMPID } from '$lib/defaults';
import type { OptRole, ScheduleRecord, TimeEntryRecord } from '$lib/types/schema';

export const QUERY = {
  REGIONS: () => {
    return {
      sql: 'SELECT region FROM opt_region',
      args: {}
    };
  },
  LEADS: (role: OptRole) => {
    return {
      sql: "SELECT id, name FROM users WHERE id > $id AND role in ('admin','lead','poc')",
      args: { id: role === 'admin' ? 0 : TEMPID }
    };
  },
  USER: (args: { user_id: number }) => {
    return {
      sql: 'SELECT * FROM view_users WHERE id = $user_id',
      args
    };
  },

  USERS_INFO: (args: {
    region?: string;
    lead_id?: number;
    active?: number;
    last_id?: number;
    limit?: number;
  }) => {
    const where = [];
    const values: {
      region?: string;
      limit?: number;
      lead_id?: number;
      active?: number;
      last_id?: number;
    } = {
      last_id: args.last_id || 0,
      limit: args.limit || LIMIT.USERS
    };
    if (args.region) {
      where.push('users.region = $region');
      values.region = args.region;
    }

    if (args.lead_id) {
      where.push('users.lead_id = $lead_id');
      values.lead_id = args.lead_id;
    }

    if (args.active !== null && args.active !== undefined) {
      where.push('active = $active');
      values.active = args.active;
    }

    return {
      sql: `SELECT
              users.id,
              users.active,
              users.name,
              users.lead_id,
              lead.name teamlead,
              users.region,
              users.role,
              users.lock_password,
              (
                SELECT
                  JSON_GROUP_ARRAY(JSON_OBJECT(
                    'id', id,
                    'effective_date', effective_date,
                    'utc_offset', utc_offset,
                    'local_offset', local_offset,
                    'clock_at', clock_at,
                    'first_break_at', first_break_at,
                    'lunch_at', lunch_at,
                    'second_break_at', second_break_at,
                    'day_off', day_off,
                    'clock_dur_min', clock_dur_min,
                    'lunch_dur_min', lunch_dur_min,
                    'break_dur_min', break_dur_min
                  )) FROM (SELECT * FROM schedules WHERE schedules.user_id = users.id ORDER BY effective_date DESC LIMIT 5 )
              ) as schedules
            FROM users
              LEFT JOIN users lead ON users.lead_id = lead.id
              WHERE users.id > $last_id ${where.length ? `AND ${where.join(' AND ')}` : ''}
              GROUP BY users.id ORDER BY users.id LIMIT $limit`,
      args: values
    };
  },
  USER_SCHEDULES: (args: { user_id: number; limit?: number }) => {
    return {
      sql: `SELECT 
      date(current_timestamp, CONCAT(local_offset, ' hours')) as date_at, * 
      FROM schedules WHERE effective_date <= date_at AND user_id = $user_id
      ORDER BY effective_date DESC LIMIT $limit`,
      args: {
        user_id: args.user_id,
        limit: !args.limit ? LIMIT.SCHEDULES : args.limit
      }
    };
  },
  SCHEDULES: (args: { user_id: number; limit?: number }) => {
    return {
      sql: `SELECT * FROM view_schedules WHERE user_id = $user_id LIMIT $limit`,
      args: {
        user_id: args.user_id,
        limit: !args.limit ? LIMIT.SCHEDULES : args.limit
      }
    };
  },
  LAST_ENTRY: (args: { user_id: number }) => {
    return {
      sql: `WITH recent AS 
      (SELECT MAX(date_at) as date_at, user_id FROM time_entries WHERE user_id = $user_id AND category = 'clock')
      SELECT e.* FROM time_entries e, recent r 
      WHERE e.date_at = r.date_at and e.user_id = r.user_id`,
      args
    };
  },
  USER_ENTRIES: (args: { user_id: number; dateStart: string; dateEnd: string }) => {
    return {
      sql: `SELECT * FROM view_time_entries WHERE user_id = $user_id AND date_at BETWEEN $dateStart and $dateEnd`,
      args
    };
  },
  LAST_CLOCKED: (args: { user_id: number }) => {
    return {
      sql: `SELECT MAX(date_at) as max_date_at, * FROM time_entries WHERE user_id = $user_id AND category = 'clock'`,
      args
    };
  }
};

export const WRITE = {
  STARTTIME: (args: Omit<TimeEntryRecord, 'id' | 'end_at' | 'elapse_sec' | 'total_sec'>) => {
    return {
      sql: `INSERT INTO time_entries 
      (user_id, sched_id, category, date_at, start_at, user_ip, user_agent, remarks)
      VALUES ($user_id, $sched_id, $category, $date_at, $start_at, $user_ip, $user_agent, ('[start]' || $remarks)) RETURNING *`,
      args
    };
  },
  ENDTIME: (
    args: Pick<TimeEntryRecord, 'id' | 'end_at' | 'user_ip' | 'user_agent' | 'remarks'>
  ) => {
    return {
      sql: `UPDATE time_entries SET 
      end_at = $end_at,
      user_ip = CONCAT(user_ip, ' | ', $user_ip),
      user_agent = CONCAT(user_agent, ' | ', $user_agent),
      remarks = NULLIF(CONCAT(remarks || CHAR(10), '[end]' || $remarks), '')
      WHERE id = $id RETURNING *`,
      args
    };
  },
  UPDATE_PASSWORD: (args: { user_id: number; password_hash: string }) => {
    return {
      sql: `UPDATE users SET password_hash = $password_hash WHERE id = $user_id`,
      args
    };
  },
  ADD_USER_SCHEDULE: (args: Omit<ScheduleRecord, 'id'>) => {
    const {
      user_id,
      effective_date,
      utc_offset,
      clock_at,
      first_break_at,
      lunch_at,
      second_break_at,
      day_off
    } = args;
    return {
      sql: `INSERT INTO schedules (user_id, effective_date, utc_offset, clock_at, first_break_at, lunch_at, second_break_at, day_off)
              VALUES($user_id, $effective_date, $utc_offset, $clock_at, $first_break_at, $lunch_at, $second_break_at, $day_off) RETURNING *`,
      args: {
        user_id,
        effective_date,
        utc_offset,
        clock_at,
        first_break_at,
        lunch_at,
        second_break_at,
        day_off
      }
    };
  }
};
