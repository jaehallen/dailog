-- DEFAULT VALUES
CREATE TABLE IF NOT EXISTS opt_region (
  region TEXT PRIMARY KEY
) WITHOUT ROWID;

INSERT INTO opt_region VALUES
('APAC'), ('EMEA'), ('NA');

CREATE TABLE IF NOT EXISTS opt_category (
  category TEXT PRIMARY KEY
) WITHOUT ROWID;

INSERT INTO opt_category VALUES ('clock'), ('lunch'), ('break'), ('coffee'), ('clinic'), ('meeting'), ('other');

CREATE TABLE IF NOT EXISTS opt_role (
  role TEXT PRIMARY KEY
) WITHOUT ROWID;

INSERT INTO opt_role VALUES ('admin'), ('lead'), ('user'), ('poc')

-- USERS TABLES
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, 
  active INTEGER NOT NULL DEFAULT 1 CHECK(active BETWEEN 0 AND 1), 
  name TEXT NOT NULL,
  region TEXT REFERENCES opt_region(region),
  role TEXT NOT NULL DEFAULT 'user' REFERENCES opt_role(role),
  password_hash TEXT NOT NULL CHECK (length(password_hash) >= 6),
  lead_id INTEGER REFERENCES users(id),
  lock_password INTEGER NOT NULL DEFAULT 0 CHECK(lock_password BETWEEN 0 AND 1),
  preferences TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leadrole ON users(lead_id, role, region);

CREATE TRIGGER IF NOT EXISTS users_updated 
AFTER UPDATE ON users WHEN old.updated_at <> CURRENT_TIMESTAMP
BEGIN
 UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
END;

-- CREATE TRIGGER IF NOT EXISTS users_lock_password AFTER UPDATE of password_hash ON users
-- BEGIN
--  UPDATE users SET lock_password = 1 WHERE id = old.id;
-- END;

-- CREATE TRIGGER IF NOT EXISTS check_password_reset BEFORE UPDATE of password_hash ON users
-- WHEN old.lock_password = 1
-- BEGIN
--   SELECT RAISE(ABORT, 'Updating password is prohibited');
-- END;

-- SESSIONS TABLES
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT NOT NULL PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions ON sessions(user_id);

-- SCHEDULES TABLES
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL references users(id),
  effective_date TEXT NOT NULL CHECK(effective_date IS date(effective_date)),
  utc_offset INTEGER NOT NULL DEFAULT 8 CHECK (utc_offset BETWEEN -12 AND 14),
  local_offset INTEGER NOT NULL DEFAULT 8 CHECK (local_offset BETWEEN -12 AND 14),
  clock_dur_min INTEGER NOT NULL DEFAULT 540,
  lunch_dur_min INTEGER NOT NULL DEFAULT 60,
  break_dur_min INTEGER NOT NULL DEFAULT 15,
  clock_at TEXT DEFAULT '00:00' CHECK(clock_at IS strftime('%R', clock_at)),
  first_break_at TEXT DEFAULT '00:00' CHECK(first_break_at IS strftime('%R', first_break_at)),
  lunch_at TEXT DEFAULT '00:00' CHECK(lunch_at IS strftime('%R', lunch_at)),
  second_break_at TEXT DEFAULT '00:00' CHECK(second_break_at IS strftime('%R', second_break_at)),
  day_off TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, effective_date)
);

CREATE INDEX IF NOT EXISTS schedules_idx ON schedules(user_id, effective_date);

-- time_entries
CREATE TABLE IF NOT EXISTS time_entries (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  sched_id INTEGER NOT NULL REFERENCES schedules(id),
  category TEXT NOT NULL REFERENCES opt_category(category),
  date_at TEXT NOT NULL,
  start_at INTEGER NOT NULL DEFAULT (unixepoch()),
  end_at INTEGER,
  user_ip TEXT,
  user_agent TEXT,
  remarks TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS entry_idx ON time_entries(user_id, date_at, category);

CREATE TRIGGER IF NOT EXISTS time_entries_updated
AFTER UPDATE ON time_entries WHEN old.updated_at <> CURRENT_TIMESTAMP
BEGIN
 UPDATE time_entries SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
END;

-- VIEW USERS
CREATE VIEW IF NOT EXISTS view_users AS
SELECT
  user.id,
  user.active,
  user.name,
  user.region,
  user.role,
  user.lead_id,
  lead.name as teamlead,
  user.password_hash,
  user.lock_password
FROM
  users user
  LEFT JOIN users lead ON lead.id = user.lead_id;

-- VIEW SCHEDULES
CREATE VIEW IF NOT EXISTS view_schedules AS
SELECT
  id,
  user_id,
  effective_date,
  utc_offset,
  local_offset,
  clock_at,
  first_break_at,
  lunch_at,
  second_break_at,
  clock_dur_min,
  lunch_dur_min,
  break_dur_min,
  day_off
FROM schedules;

-- expensive make sure to query with user_id
CREATE VIEW current_schedules AS
SELECT
  date(current_timestamp, CONCAT (utc_offset, ' hours')) as date_at,
  *
FROM
  schedules
WHERE
  effective_date <= date_at
ORDER BY
  effective_date desc;

-- VIEW TIME ENTRIES
CREATE VIEW IF NOT EXISTS view_time_entries AS
SELECT
  id,
  user_id,
  sched_id,
  category,
  date_at,
  start_at,
  end_at,
  remarks
  FROM time_entries;

-- VIEW USER & SCHEDULES ADMIN DASHBOARD
CREATE VIEW users_schedules AS
SELECT
  users.id,
  users.active,
  users.name,
  users.region,
  users.role,
  users.lead_id,
  schedules.id as sched_id,
  schedules.effective_date,
  schedules.utc_offset,
  schedules.local_offset,
  schedules.clock_at,
  schedules.first_break_at,
  schedules.lunch_at,
  schedules.second_break_at,
  schedules.day_off,
  schedules.clock_dur_min,
  schedules.break_dur_min,
  schedules.lunch_dur_min
FROM
  users
  LEFT JOIN schedules ON user.id = schedules.user_id;

-- USERS LIST ADMIN DASHBOARD
CREATE VIEW users_list AS
SELECT
  users.id,
  users.active,
  users.name,
  users.region,
  users.role,
  users.lead_id,
  lead.name as teamlead,
  users.lock_password,
  max(schedules.effective_date) as latest_schedule,
  count(schedules.id) as total_schedule 
FROM
  users
  LEFT JOIN users lead
  LEFT JOIN schedules
  WHERE users.id = schedules.user_id AND users.lead_id = lead.id
  GROUP BY users.id
  ORDER BY users.id;
  
-- ADMIN DASHBOARD QUERY
CREATE VIEW IF NOT EXISTS users_info AS SELECT
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
  ))
    FROM (SELECT * FROM schedules WHERE schedules.user_id = users.idORDER BY effective_date DESC LIMIT 5 )
  ) as schedules
FROM users
  LEFT JOIN users lead ON users.lead_id = lead.id
  GROUP BY users.id
  ORDER BY users.id;

-- Create a table. And an external content fts5 table to index it.
CREATE VIRTUAL TABLE fts_users USING fts5(name, tokenize='trigram', content='users', content_rowid='id' );

-- Triggers to keep the FTS index up to date.
CREATE TRIGGER fts_user_insert AFTER INSERT ON users BEGIN
  INSERT INTO fts_users(rowid, name) VALUES (new.id, new.name);
END;

CREATE TRIGGER fts_user_delete AFTER DELETE ON users BEGIN
  INSERT INTO fts_users(fts_users, rowid, name) VALUES('delete', old.id, old.name);
END;

CREATE TRIGGER fts_user_update AFTER UPDATE ON users WHEN old.name <> new.name
BEGIN 
  INSERT INTO fts_users(fts_users, rowid, name) VALUES('delete', old.id, old.name);
  INSERT INTO fts_users(rowid, name) VALUES (new.id, new.name);
END;

INSERT INTO fts_users(fts_users) VALUES('rebuild');


-- INSERT DEFAULT USER
INSERT INTO users ("id","name","region","role","password_hash","lead_id","lock_password")
VALUES
(100000, "Admin",null,"admin","c1af01ec84c4ea44cacf0774e51e9e01:666bc8196e924bdd60161ff14b33623b957c164c729797c272d4e306d366bac8",null,1), -- admin@hopkins
(100001, "Lead of Hopkins","APAC","lead","a8eff657adbb271dcd36cd22e5848dae:b1fe08ccf5652b823a2fa6e48be02d6d33496435c46ec2793c62f92e3b8ede91",100000,1), -- lead@hopkins
(100002, "POC of Hopkins","APAC","poc","91ac3f14d8f75922628a92b34309effb:1e431a6da47a1037254b7ac7ab1c001d3a1984382b38766d3bc98971325f1faf",200000,1); -- poc@hopkins
