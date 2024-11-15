import { LIMIT, TEMPID } from '$lib/defaults';
import type { OptRole, ScheduleRecord, TimeEntryRecord, UserRecord } from '$lib/types/schema';
import { isAdmin } from '$lib/permission';
import type { SearchOptions } from '$lib/validation';

export const QUERY = {
  REGIONS: () => {
    return {
      sql: 'SELECT region FROM opt_region',
      args: {}
    };
  },
  LEADS: (args: { id: number, role: OptRole, region: string }) => {
    const values: {
      id: number,
      region?: string
    } = {
      id: args.id < TEMPID ? 0 : TEMPID,
    };

    
    if(!isAdmin(args.role)){
      values.region = args.region;
    }

    const  regionClause = values.region ? 'AND region = $region' : '';
    return {
      sql: `SELECT id, name, region FROM users WHERE id > $id AND role in ('admin', 'editor','scheduler','lead','poc') AND active = 1 ${regionClause}`,
      args: values,
    };
  },
  USER: (args: { user_id: number }) => {
    return {
      sql: 'SELECT * FROM users WHERE id = $user_id',
      args
    };
  },
  USER_PROFILE: (args: { user_id: number }) => {
    return {
      sql: `SELECT * FROM view_users WHERE id = $user_id`,
      args
    };
  },
  USERS_INFO: (args: SearchOptions) => {
    const where = [];
    const values: Partial<SearchOptions> = {
      limit: args.limit || LIMIT.USERS,
      last_id: args.last_id || 0
    };

    if (args.region && args.region.length > 0) {
      where.push('users.region = $region');
      values.region = args.region;
    }

    if (args.lead_id) {
      where.push('users.lead_id = $lead_id');
      values.lead_id = args.lead_id;
    }

    if (args.active !== null && !isNaN(args.active)) {
      where.push('users.active = $active');
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
              users.created_at,
              users.updated_at,
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
  SEARCH_USER: (args: SearchOptions) => {
    const values: Partial<SearchOptions> = {
      search: args.search,
      last_id: args.last_id
    };
    if (args.region && args.region.length > 0) {
      values.region = args.region;
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
              users.created_at,
              users.updated_at,
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
              JOIN fts_users ON fts_users.rowid = users.id
              WHERE users.id > $last_id AND fts_users MATCH $search ${values.region ? ` AND users.region = $region` : ''}`,
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
  },
  SEARCH_USER_TIME_ENTRIES: (args: { search: string; date_at: string; region?: string | null }) => {
    const values: typeof args = {
      search: args.search,
      date_at: args.date_at
    };

    if (args.region) {
      values.region = args.region;
    }

    return {
      sql: `SELECT
              time_entries.id id,
              time_entries.user_id user_id,
              users.name name,
              users.region region,
              sched_id,
              category,
              date_at,
              start_at,
              end_at,
              remarks,
              schedules.utc_offset,
              schedules.local_offset,
              schedules.clock_at,
              schedules.effective_date,
              schedules.clock_dur_min,
              schedules.break_dur_min,
              schedules.lunch_dur_min
            FROM time_entries
            LEFT JOIN users ON users.id = time_entries.user_id
            LEFT JOIN schedules ON time_entries.sched_id = schedules.id
            JOIN fts_users WHERE fts_users.rowid = time_entries.user_id AND fts_users match $search 
                AND date_at = $date_at ${args.region ? 'AND region = $region' : ''}`,
      args: values
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
  INSERT_USER: (args: Pick<UserRecord, 'id' | 'name' | 'region' | 'lead_id' | 'password_hash'>) => {
    return {
      sql: `INSERT INTO users (id, name, region, lead_id, password_hash) VALUES ($id, $name, $region, $lead_id, $password_hash) RETURNING *`,
      args
    };
  },
  UPDATE_USER: (args: Omit<UserRecord, 'password_hash' | 'preferences'>) => {
    const { lock_password, active, ...user } = args;
    return {
      sql: `UPDATE users SET name = $name, region = $region, lead_id = $lead_id, role = $role, active = $active, lock_password = $lock_password WHERE id = $id RETURNING *`,
      args: {
        ...user,
        lock_password: Number(lock_password),
        active: Number(active)
      }
    };
  },
  UPDATE_PREFERENCE: (args: {
    id: number;
    avatar_src?: string | null;
    background_src?: string | null;
    theme?: string | null;
  }) => {
    return {
      sql: `UPDATE users 
              SET preferences = 
                  IFNULL(
                    json_set(preferences, 
                      '$.avatar_src',$avatar_src, 
                      '$.background_src', $background_src, 
                      '$.theme',$theme
                    ),
                    json_object(
                      'avatar_src',$avatar_src, 
                      'background_src', $background_src, 
                      'theme',$theme
                    )
                  )
              WHERE id = $id RETURNING preferences`,
      args: {
        id: args.id,
        avatar_src: args.avatar_src ?? null,
        background_src: args.background_src ?? null,
        theme: args.theme ?? null
      }
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
              VALUES($user_id, $effective_date, $utc_offset, $clock_at, $first_break_at, $lunch_at, $second_break_at, $day_off) 
              ON CONFLICT (user_id, effective_date)
              DO UPDATE SET 
                utc_offset = excluded.utc_offset,
                clock_at = excluded.clock_at,
                first_break_at = excluded.first_break_at,
                lunch_at = excluded.lunch_at,
                second_break_at = excluded.second_break_at,
                day_off = excluded.day_off
              RETURNING *`,
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
  },
  UPDATE_MANY_USER: (args: Pick<UserRecord, 'id' | 'lead_id' | 'lock_password' | 'region'>) => {
    const set = [];
    const returnFields: (keyof UserRecord)[] = ['id', 'updated_at'];
    const values: Partial<typeof args> = {
      id: args.id
    };

    if (args.lead_id) {
      set.push('lead_id = $lead_id');
      values.lead_id = args.lead_id;
      returnFields.push('lead_id');
    }

    if (
      args.lock_password !== null &&
      args.lock_password !== undefined &&
      typeof args.lock_password == 'number'
    ) {
      set.push('lock_password = $lock_password');
      values.lock_password = args.lock_password;
      returnFields.push('lock_password');
    }

    if (args.region) {
      set.push('region = $region');
      values.region = args.region;
      returnFields.push('region');
    }

    if (!set.length) {
      throw new Error('No value to set');
    }

    return {
      sql: `UPDATE users SET ${set.join(', ')} WHERE id = $id RETURNING ${returnFields.join(', ')}`,
      args: values
    };
  },
  ADD_MANY_SCHEDULE: (
    args: (Omit<ScheduleRecord, 'id'> & { [key: string]: number | string })[]
  ) => {
    const arr = [
      'user_id',
      'effective_date',
      'utc_offset',
      'clock_at',
      'first_break_at',
      'lunch_at',
      'second_break_at',
      'day_off'
    ];
    const values = args.map((arg) => arr.map((h) => arg[h]));
    return {
      sql: `INSERT INTO schedules (user_id, effective_date, utc_offset, clock_at, first_break_at, lunch_at, second_break_at, day_off)
              VALUES ?
              ON CONFLICT (user_id, effective_date)
              DO UPDATE SET 
                utc_offset = excluded.utc_offset,
                clock_at = excluded.clock_at,
                first_break_at = excluded.first_break_at,
                lunch_at = excluded.lunch_at,
                second_break_at = excluded.second_break_at,
                day_off = excluded.day_off
              RETURNING *`,
      args: values
    };
  }
};
