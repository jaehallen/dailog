-- DEFAULT VALUES
CREATE TABLE IF NOT EXISTS opt_region (
  region TEXT PRIMARY KEY
) WITHOUT ROWID;

INSERT INTO opt_region VALUES
('APAC'), ('EMEA'), ('NA');

CREATE TABLE IF NOT EXISTS opt_category (
  category TEXT PRIMARY KEY
) WITHOUT ROWID;

INSERT INTO opt_category VALUES ('clock'), ('lunch'), ('break'), ('coffee'), ('clinic');

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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leadrole ON users(region, lead_id, role);

CREATE TRIGGER IF NOT EXISTS users_updated 
AFTER UPDATE ON users WHEN old.updated_at <> CURRENT_TIMESTAMP
BEGIN
 UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS users_lock_password AFTER UPDATE of password_hash ON users
BEGIN
 UPDATE users SET lock_password = 1 WHERE id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS check_password_reset BEFORE UPDATE of password_hash ON users
WHEN old.lock_password = 1
BEGIN
  SELECT RAISE(ABORT, 'Updating password is prohibited');
END;

-- SESSIONS TABLES
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions ON sessions(id);

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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, effective_date)
);

CREATE INDEX IF NOT EXISTS idx1 ON schedules(user_id, effective_date);

-- time_entries
CREATE TABLE IF NOT EXISTS time_entries (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  sched_id INTEGER NOT NULL REFERENCES schedules(id),
  category TEXT NOT NULL REFERENCES opt_type(category),
  date_at TEXT NOT NULL,
  start_at INTEGER NOT NULL DEFAULT (unixepoch()),
  end_at INTEGER,
  user_ip TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx1 ON time_entries(user_id, date_at, category);

CREATE TRIGGER IF NOT EXISTS time_entries_updated
AFTER UPDATE ON time_entries WHEN old.updated_at <> CURRENT_TIMESTAMP
BEGIN
 UPDATE time_entries SET updated_at = (unixepoch()) WHERE id = old.id;
END;

-- 

-- USERS INFO
CREATE VIEW IF NOT EXISTS users_info AS
SELECT u.id, u.name, u.region, u.lead_id, l.name as teamlead, 
  max(s.date_at) as date_at,
  s.local_offset, s.utc_offset, s.clock_at, s.first_break_at, s.lunch_at,s.second_break_at
FROM users u
LEFT JOIN users l ON l.role != 'user' and l.id = u.lead_id
LEFT JOIN schedules s ON s.user_id = u.id GROUP by u.id

-- INSERT DEFAULT USER
INSERT INTO users ("id","name","region","role","password_hash","lead_id","lock_password")
VALUES
(100000, "Admin",null,"admin","$argon2id$v=19$m=19456,t=2,p=1$Fg9DjFhBJuBXhgjSX38d4w$c2ZTJ4fWagrJoLKhgEQsuziwJDIoziOfMaH7CEtVUHk",null,1), -- admin@hopkins
(200000, "Lead of Hopkins",null,"lead","$argon2id$v=19$m=19456,t=2,p=1$e/kyaHEgKiVayAukHn4NhQ$ARwgHuRkfzL34ghl8bn5LSWa8wg77bvki+4ZMXm+MlI",null,1), -- lead@hopkins
(200001, "POC of Hopkins","APAC","poc","$argon2id$v=19$m=19456,t=2,p=1$qfG/whO6udTe746oZFHRBA$fVSALwxWHHKKaeF+AbgH0f5sC9j4pluGs12Lr9H1wCQ",null,1); -- poc@hopkins
