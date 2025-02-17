

Chronoz V1.0  
@chronoz.pages.dev

Allen Garchitorena  
Table of Contents

[**1\. Table Documentation	3**](#table-documentation)

[1.1 fts\_users (fts5)	3](#1.1-fts_users-\(fts5\))

[1.2 opt\_category	5](#1.2-opt_category)

[1.3 opt\_region	6](#1.3-opt_region)

[1.4 opt\_role	7](#1.4-opt_role)

[1.5 schedules	8](#1.5-schedules)

[1.6 sessions	10](#1.6-sessions)

[1.7 time\_entries	11](#1.7-time_entries)

[1.8 users	14](#1.8-users)

[**2\. Database Schema	17**](#database-schema)

[2.1 \[fts5 \- fts\_users\]	17](#2.1-[fts5---fts_users])

[2.1.1 \[fts\_users\_config\]	17](#2.1.1-[fts_users_config])

[2.1.2 \[fts\_users\_data\]	17](#2.1.2-[fts_users_data])

[2.1.3 \[fts\_users\_docsize\]	17](#2.1.3-[fts_users_docsize])

[2.1.4 \[fts\_users\_idx\]	17](#2.1.4-[fts_users_idx])

[2.2 \[opt\_category\]	18](#2.2-[opt_category])

[2.3 \[opt\_region\]	19](#2.3-[opt_region])

[2.4 \[opt\_role\]	20](#2.4-[opt_role])

[2.5 \[schedules\]	21](#2.5-[schedules])

[2.6 \[sessions\]	22](#2.6-[sessions])

[2.7 \[time\_entries\]	23](#2.7-[time_entries])

[2.8 \[users\]	25](#2.8-[users])

1. # **Table Documentation** {#table-documentation}

   

## **1.1 fts\_users (fts5)** {#1.1-fts_users-(fts5)}

Overview  
The fts\_users virtual table is implemented using the FTS5 module with trigram tokenization in libSQL. It enhances the search functionality on the name field of the users table, allowing for efficient and flexible text searching, including partial matches. This is particularly useful for implementing features like autocomplete and fuzzy searching.

Why Use Trigram Tokenization?  
Trigram tokenization breaks the text into overlapping sequences of three characters, enabling more flexible matching. This is beneficial for handling typos, partial inputs, and other variations in user search queries.

Table Definition  
CREATE VIRTUAL TABLE fts\_users USING fts5(  
  name,  
  tokenize='trigram',  
  content='users',  
  content\_rowid='id'  
);

* name: The column indexed for full-text search.  
* tokenize='trigram': Specifies the trigram tokenization method.  
* content='users': Indicates that the content being indexed comes from the users table.  
* content\_rowid='id': Associates each indexed row with the id column of the users table.

Virtual Table Structure  
Creating the fts\_users virtual table generates several underlying tables:

1\. fts\_users\_config

* Purpose: Stores configuration settings for the FTS5 virtual table.  
* Schema:  
  * k TEXT: Key for configuration option.  
  * v TEXT: Value of the configuration option.

2\. fts\_users\_data

* Purpose: Contains the indexed content in a compressed format for efficient storage and retrieval.  
* Schema:  
  * id INTEGER PRIMARY KEY: Row identifier corresponding to id in users  
  * block BLOB: Compressed block of indexed data.

3\. fts\_users\_docsize

* Purpose: Tracks the size of each document (row) to support relevance ranking.  
* Schema:  
  * id INTEGER PRIMARY KEY: Row identifier.  
  * sz BLOB: Size metadata for relevance ranking.

4\. fts\_users\_idx

* Purpose: Manages the indexing structure, mapping terms to document identifiers for efficient searching.  
* Schema:  
  * segid TEXT: Segment identifier for organizing index data.  
  * pgno TEXT PRIMARY KEY: Page number within the segment for indexing.

How It Works

1. Indexing: When a row is inserted or updated in the users table, the name field is tokenized using the trigram tokenizer and stored in fts\_users\_data.  
     
2. Searching: Search queries are matched against the trigrams in fts\_users\_idx, leveraging the index structure for fast retrieval.  
     
3. Relevance Ranking: Results are ranked based on document size and term frequency, stored in fts\_users\_docsize.

## **1.2 opt\_category** {#1.2-opt_category}

Overview  
The opt\_category table is a static lookup table used to categorize different types of events or activities, such as 'clock', 'bio', 'lunch', 'break', 'coffee', 'clinic', 'meeting', and 'other'. It is designed to be lightweight and efficient by using the WITHOUT ROWID option, which improves performance by directly storing the primary key in the B-Tree structure.

Table Definition  
CREATE TABLE IF NOT EXISTS opt\_category (  
   category TEXT PRIMARY KEY  
 ); WITHOUT ROWID;

Additionally, the table is pre-populated with a set of predefined categories:  
INSERT INTO opt\_category VALUES   
  ('clock'),   
  ('bio'),   
  ('lunch'),   
  ('break'),   
  ('coffee'),   
  ('clinic'),   
  ('meeting'),   
  ('other');

Table Structure

* category (TEXT, PRIMARY KEY, NOT NULL)  
  This column holds the name of the category. It is the primary key, ensuring that each category is unique.

* WITHOUT ROWID  
  The table is created without a rowid to optimize storage and performance, as the primary key (category) is directly used as the identifier. This structure is suitable for lookup tables with unique values.

How It Works

* Efficient Storage and Lookup:  
  Using WITHOUT ROWID reduces storage overhead and speeds up lookups because the category column is directly used as the primary key without the need for an additional row identifier.  
    
* Data Integrity and Uniqueness:  
  The PRIMARY KEY constraint ensures that each category is unique, preventing duplicate entries.

## **1.3 opt\_region** {#1.3-opt_region}

Overview  
The opt\_region table is a static lookup table designed to store a predefined list of regions: 'APAC', 'EMEA', and 'NA'. It helps maintain data consistency and normalization across the database by categorizing users, schedules, or other entities by region. The WITHOUT ROWID option enhances performance and reduces storage overhead.

Table Definition  
CREATE TABLE IF NOT EXISTS opt\_region (  
  region TEXT PRIMARY KEY  
) WITHOUT ROWID;

The table is then populated with predefined region values:  
INSERT INTO opt\_region VALUES   
  ('APAC'),   
  ('EMEA'),   
  ('NA');

Table Structure

* region (TEXT, PRIMARY KEY, NOT NULL)  
  This column holds the name of the region. It serves as the primary key, ensuring that each region name is unique.  
    
* WITHOUT ROWID  
  This option optimizes the table's storage and lookup performance by using the primary key (region) as the identifier, eliminating the need for an additional rowid.

How It Works

* Efficient Storage and Lookup:  
  By using WITHOUT ROWID, the region column directly serves as the primary key, reducing storage space and improving query performance.  
    
* Data Integrity and Uniqueness:  
  The PRIMARY KEY constraint ensures that each region is unique, preventing duplicate entries.

## **1.4 opt\_role** {#1.4-opt_role}

Overview  
The opt\_role table is a static lookup table designed to store a predefined list of user roles: 'admin', 'lead', 'user', 'poc', 'editor', and 'scheduler'. It standardizes role assignments across the system, ensuring consistency and facilitating role-based access control. The WITHOUT ROWID option optimizes storage and lookup performance.

Table Definition  
CREATE TABLE IF NOT EXISTS opt\_role (  
  role TEXT PRIMARY KEY  
) WITHOUT ROWID;

The table is then populated with predefined role values:  
INSERT INTO opt\_role VALUES   
  ('admin'),   
  ('lead'),   
  ('user'),   
  ('poc'),   
  ('editor'),   
  ('scheduler');

Table Structure

* role (TEXT, PRIMARY KEY, NOT NULL)  
  This column holds the name of the role. It serves as the primary key, ensuring that each role is unique.  
    
* WITHOUT ROWID  
  This option optimizes the table's storage and lookup performance by using the primary key (role) as the identifier, eliminating the need for an additional rowid.

How It Works

* Efficient Storage and Lookup:  
  By using WITHOUT ROWID, the role column directly serves as the primary key, reducing storage space and improving query performance.  
    
* Data Integrity and Uniqueness:  
  The PRIMARY KEY constraint ensures that each role is unique, preventing duplicate entries.

## **1.5 schedules** {#1.5-schedules}

Overview  
The schedules table is designed to manage user work schedules, including clock-in/out times, breaks, lunch duration, and days off. It ensures data integrity through constraints like CHECK, UNIQUE, and foreign key references. Additionally, an index is created to optimize query performance on frequently used columns.

Table Definition  
CREATE TABLE IF NOT EXISTS schedules (  
  id INTEGER PRIMARY KEY,  
  user\_id INTEGER NOT NULL REFERENCES users(id),  
  effective\_date TEXT NOT NULL CHECK(effective\_date IS date(effective\_date)),  
  utc\_offset INTEGER NOT NULL DEFAULT 8 CHECK (utc\_offset BETWEEN \-12 AND 14),  
  local\_offset INTEGER NOT NULL DEFAULT 8 CHECK (local\_offset BETWEEN \-12 AND 14),  
  clock\_dur\_min INTEGER NOT NULL DEFAULT 540,  
  lunch\_dur\_min INTEGER NOT NULL DEFAULT 60,  
  break\_dur\_min INTEGER NOT NULL DEFAULT 15,  
  clock\_at TEXT DEFAULT '00:00' CHECK(clock\_at IS strftime('%R', clock\_at)),  
  first\_break\_at TEXT DEFAULT '00:00' CHECK(first\_break\_at IS strftime('%R', first\_break\_at)),  
  lunch\_at TEXT DEFAULT '00:00' CHECK(lunch\_at IS strftime('%R', lunch\_at)),  
  second\_break\_at TEXT DEFAULT '00:00' CHECK(second\_break\_at IS strftime('%R', second\_break\_at)),  
  day\_off TEXT,  
  created\_at TEXT NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  UNIQUE(user\_id, effective\_date)  
);

CREATE INDEX IF NOT EXISTS schedules\_idx ON schedules(effective\_date, user\_id);

Table Structure

* id (INTEGER, PRIMARY KEY, Auto-Increment)  
  Unique identifier for each schedule entry.  
    
* user\_id (INTEGER, NOT NULL, FK)  
  References id from the users table, associating each schedule with a specific user.  
    
* effective\_date (TEXT, NOT NULL)  
  The date the schedule is effective, validated using CHECK to ensure a valid date format.  
    
* utc\_offset (INTEGER, NOT NULL, DEFAULT 8\)  
  UTC offset for the user's timezone, validated to be between \-12 and 14\.  
    
* local\_offset (INTEGER, NOT NULL, DEFAULT 8\)  
  Local time offset, similar constraints as utc\_offset.  
    
* clock\_dur\_min (INTEGER, NOT NULL, DEFAULT 540\)  
  Total clocked-in duration in minutes.  
    
* lunch\_dur\_min (INTEGER, NOT NULL, DEFAULT 60\)  
  Duration of lunch break in minutes.  
    
* break\_dur\_min (INTEGER, NOT NULL, DEFAULT 15\)  
  Duration of other breaks in minutes.  
    
* clock\_at (TEXT, DEFAULT '00:00')  
  Clock-in time, validated using CHECK to ensure a valid time format.  
    
* first\_break\_at (TEXT, DEFAULT '00:00')  
  Time for the first break, with time format validation.  
    
* lunch\_at (TEXT, DEFAULT '00:00')  
  Lunch break start time, with time format validation.  
    
* second\_break\_at (TEXT, DEFAULT '00:00')  
  Time for the second break, with time format validation.  
    
* day\_off (TEXT, NULL)  
  Optional field indicating a day off (e.g., 'Sunday', 'Holiday').  
    
* created\_at (TEXT, NOT NULL, DEFAULT CURRENT\_TIMESTAMP)  
  Timestamp of when the schedule was created.  
    
* UNIQUE(user\_id, effective\_date)  
  Ensures that each user has only one schedule per effective date.  
    
* Index:  
  An index on effective\_date and user\_id optimizes queries filtering by date and user.

How It Works

* Data Integrity and Validation:  
  * CHECK constraints ensure that date and time formats are correct.  
  * UNIQUE constraint prevents duplicate schedules for the same user on the same date.  
  * FOREIGN KEY enforces a valid user\_id from the users table.  
* Time Zone Management:  
  * utc\_offset and local\_offset allow flexible timezone support for global users.

## **1.6 sessions** {#1.6-sessions}

Overview  
The sessions table is designed to manage user sessions, storing session identifiers, expiration times, and associated user IDs. This structure is optimized for session validation and user authentication in applications. An index on the user\_id column enhances query performance when filtering by user.

Table Definition  
CREATE TABLE IF NOT EXISTS sessions (  
  id TEXT NOT NULL PRIMARY KEY,  
  expires\_at INTEGER NOT NULL,  
  user\_id INTEGER NOT NULL REFERENCES users(id)  
);

CREATE INDEX IF NOT EXISTS idx\_sessions ON sessions(user\_id);

Table Structure

* id (TEXT, NOT NULL, PRIMARY KEY)  
  Unique identifier for each session, typically a randomly generated token or UUID.  
  Ensures session uniqueness and fast lookups.

* expires\_at (INTEGER, NOT NULL)  
  Stores the expiration timestamp as a Unix epoch (number of seconds since January 1, 1970).  
  Used to determine session validity.  
    
* user\_id (INTEGER, NOT NULL, FK)  
  References id from the users table, linking each session to a specific user.  
  Enforces relational integrity to prevent orphaned sessions.

* Index:  
  idx\_sessions on user\_id improves performance for queries filtering by user, useful in cases like retrieving active sessions for a user.

How It Works

* Session Management:  
  * Each session is uniquely identified by the id column.  
  * expires\_at is checked during authentication to ensure the session is still valid.  
* Data Integrity and Security:  
  * PRIMARY KEY on id guarantees session ID uniqueness.  
  * FOREIGN KEY on user\_id enforces a valid relationship to the users table, ensuring sessions are linked to existing users.

## **1.7 time\_entries** {#1.7-time_entries}

Overview  
The time\_entries table logs user activities or events with timestamps, linking them to schedules and categories. It supports detailed tracking of time-based entries, including start and end times, IP addresses, and user agents. An index enhances query performance, and a trigger ensures automatic updates to the timestamp when a record is modified.

Table Definition  
CREATE TABLE IF NOT EXISTS time\_entries (  
  id INTEGER PRIMARY KEY,  
  user\_id INTEGER NOT NULL REFERENCES users(id),  
  sched\_id INTEGER NOT NULL REFERENCES schedules(id),  
  category TEXT NOT NULL REFERENCES opt\_category(category),  
  date\_at TEXT NOT NULL,  
  start\_at INTEGER NOT NULL DEFAULT (unixepoch()),  
  end\_at INTEGER,  
  user\_ip TEXT,  
  user\_agent TEXT,  
  remarks TEXT,  
  created\_at TEXT NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at TEXT NOT NULL DEFAULT CURRENT\_TIMESTAMP  
);

CREATE INDEX IF NOT EXISTS entry\_idx ON time\_entries(user\_id, date\_at, category);

CREATE TRIGGER IF NOT EXISTS time\_entries\_updated  
AFTER UPDATE ON time\_entries WHEN old.updated\_at \<\> CURRENT\_TIMESTAMP  
BEGIN  
  UPDATE time\_entries SET updated\_at \= CURRENT\_TIMESTAMP WHERE id \= old.id;  
END;

Table Structure

* id (INTEGER, PRIMARY KEY)  
  Unique identifier for each time entry.  
  Auto-incremented, ensuring uniqueness and fast lookups.  
    
* user\_id (INTEGER, NOT NULL, FK)  
  Links to the id in the users table, associating the time entry with a specific user.  
  Enforces relational integrity to ensure entries are linked to existing users.  
    
* sched\_id (INTEGER, NOT NULL, FK)  
  References id from the schedules table, connecting each entry to a specific schedule.

* category (TEXT, NOT NULL, FK)  
  Categorizes the time entry, referencing category from opt\_category.  
  Examples: clock, lunch, break, meeting, etc.  
    
* date\_at (TEXT, NOT NULL)  
  Represents the date of the time entry.  
  Stored as text for flexibility in date formatting.  
    
* start\_at (INTEGER, NOT NULL, DEFAULT unixepoch())  
  Start time stored as a Unix timestamp.  
  Defaults to the current Unix epoch when the entry is created.  
    
* end\_at (INTEGER, NULL)  
  End time stored as a Unix timestamp.  
  Nullable to accommodate ongoing or open-ended events.  
    
* user\_ip (TEXT, NULL)  
  Records the IP address of the user making the entry.  
  Useful for security and auditing purposes.  
    
* user\_agent (TEXT, NULL)  
  Captures the user agent string, providing details about the device and browser.  
    
* remarks (TEXT, NULL)  
  Allows optional notes or comments related to the time entry.  
    
* created\_at (TEXT, NOT NULL, DEFAULT CURRENT\_TIMESTAMP)  
  Timestamp of when the entry was created.  
  Automatically set to the current time.

* updated\_at (TEXT, NOT NULL, DEFAULT CURRENT\_TIMESTAMP)  
  Timestamp of the last update.  
  Automatically maintained by the trigger for accurate tracking.


Index and Trigger

* Index:  
  * entry\_idx on (user\_id, date\_at, category) improves query performance when filtering by user, date, and category.  
  * Useful for reports, summaries, or time tracking queries.


* Trigger:  
  * time\_entries\_updated ensures updated\_at is automatically set to the current timestamp when a record is modified.  
  * Guarantees accurate tracking of modifications.  
  * 

How It Works

* Time Tracking and Categorization:  
  * start\_at and end\_at allow precise tracking of time durations.  
  * category helps in classifying entries for better reporting and analysis.  
      
* Data Integrity and Consistency:  
  * FOREIGN KEY constraints ensure valid references to users, schedules, and categories.  
  * UNIQUE and NOT NULL constraints maintain data integrity.


## **1.8 users** {#1.8-users}

Overview  
The users table manages user accounts with details such as active status, name, region, role, password security, and hierarchical reporting structure. It supports role-based access control, regional grouping, and user preferences. Indexes enhance query performance, and a trigger keeps the updated\_at timestamp current.

Table Definition  
CREATE TABLE IF NOT EXISTS users (  
  id INTEGER PRIMARY KEY,   
  active INTEGER NOT NULL DEFAULT 1 CHECK(active BETWEEN 0 AND 1),   
  name TEXT NOT NULL,  
  region TEXT REFERENCES opt\_region(region),  
  role TEXT NOT NULL DEFAULT 'user' REFERENCES opt\_role(role),  
  password\_hash TEXT NOT NULL CHECK (length(password\_hash) \>= 6),  
  lead\_id INTEGER REFERENCES users(id),  
  lock\_password INTEGER NOT NULL DEFAULT 0 CHECK(lock\_password BETWEEN 0 AND 1),  
  preferences TEXT,  
  created\_at TEXT NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at TEXT NOT NULL DEFAULT CURRENT\_TIMESTAMP  
);

DROP INDEX IF EXISTS idx\_users\_leads;  
CREATE INDEX IF NOT EXISTS idx\_users\_leads ON users(lead\_id, region, active);

DROP INDEX IF EXISTS idx\_users\_roles;  
CREATE INDEX IF NOT EXISTS idx\_users\_roles ON users(role, region, active);

DROP INDEX IF EXISTS idx\_users\_regions;  
CREATE INDEX IF NOT EXISTS idx\_users\_regions ON users(region, active);

CREATE TRIGGER IF NOT EXISTS users\_updated   
AFTER UPDATE ON users WHEN old.updated\_at \<\> CURRENT\_TIMESTAMP  
BEGIN  
  UPDATE users SET updated\_at \= CURRENT\_TIMESTAMP WHERE id \= old.id;  
END;

Table Structure

* id (INTEGER, PRIMARY KEY)  
  Unique identifier for each user.  
  Auto-incremented, ensuring uniqueness.  
    
* active (INTEGER, NOT NULL, DEFAULT 1, CHECK(active BETWEEN 0 AND 1))  
  Indicates if the user is active (1) or inactive (0).  
  Enforces a binary state for clear user status management.  
    
* name (TEXT, NOT NULL)  
  Full name of the user.  
  Required for identification and display purposes.  
    
* region (TEXT, FK)  
  Links to region in the opt\_region table.  
  Categorizes users by geographical region (e.g., APAC, EMEA, NA).

* role (TEXT, NOT NULL, DEFAULT 'user', FK)  
  References role in opt\_role, defining the user's access level.  
  Examples: admin, lead, user, poc, editor, scheduler.  
    
* password\_hash (TEXT, NOT NULL, CHECK (length(password\_hash) \>= 6))  
  Stores the hashed password for security.  
  Ensures minimum length for better security standards.

* lead\_id (INTEGER, FK)  
  References another user's id, establishing a reporting hierarchy.  
  Supports organizational structures (e.g., manager-subordinate relationships).

* lock\_password (INTEGER, NOT NULL, DEFAULT 0, CHECK(lock\_password BETWEEN 0 AND 1))  
  Indicates if the user can change their password (0 for allowed, 1 for locked).  
  Useful for administrative control over password updates.

* preferences (TEXT, NULL)  
  Stores user-specific settings or preferences in serialized format (e.g., JSON).  
  Provides customization for the user experience.

* created\_at (TEXT, NOT NULL, DEFAULT CURRENT\_TIMESTAMP)  
  Timestamp of when the user account was created.  
  Automatically set to the current time.

* updated\_at (TEXT, NOT NULL, DEFAULT CURRENT\_TIMESTAMP)  
  Timestamp of the last update.  
  Maintained by the trigger to ensure accurate modification tracking.

Indexes and Trigger

* Indexes:  
  * idx\_users\_leads on (lead\_id, region, active)  
    * Speeds up hierarchical queries, such as retrieving subordinates by region and status.  
  * idx\_users\_roles on (role, region, active)  
    * Optimizes role-based access control queries.  
  * idx\_users\_regions on (region, active)  
    * Enhances performance for regional user management.  
        
* Trigger:  
  * users\_updated automatically updates the updated\_at column when any user record is modified.  
  * Ensures consistent and accurate modification timestamps.  
    

How It Works

* User Management and Role-Based Access:  
  * Assigns roles and regions, supporting multi-region and multi-role setups.  
  * Handles hierarchical reporting using lead\_id.

* Security and Integrity:  
  * password\_hash enforces a minimum length for better security.  
  * lock\_password provides administrative control over password changes.

* Data Consistency and Performance:  
  * FOREIGN KEY constraints maintain relational integrity.  
  * Indexes improve query performance for common filtering conditions.

2. # **Database Schema** {#database-schema}

| 2.1 \[fts5 \- fts\_users\] |  |  |
| :---- | ----- | ----- |

Linked

| 2.1.1 *\[fts\_users\_config\]* |  |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Key** | **Name** | **Data Type** | **Max Length** | **Nullability** | **Identity** | **Default** |
|  | k | TEXT |  \-  | NULL |  \-  |  \-  |
|  | v | TEXT |  \-  | NULL |  \-  |  \-  |
| **2.1.2 *\[fts\_users\_data\]*** |  |  |  |  |  |  |
| PK | id | INTEGER |  \-  | NULL |  \-  |  \-  |
|  | block | BLOB |  \-  | NULL |  \-  |  \-  |
| **2.1.3 *\[fts\_users\_docsize\]*** |  |  |  |  |  |  |
| PK | id | INTEGER |  \-  | NULL |  \-  |  \-  |
|  | sz | BLOB |  \-  | NULL |  \-  |  \-  |
| **2.1.4 *\[fts\_users\_idx\]*** |  |  |  |  |  |  |
|  | segid | TEXT |  \-  | NULL |  \-  |  \-  |
| PK | pgno | TEXT |  \-  | NULL |  \-  |  \-  |

| 2.2 \[opt\_category\] |  |  |
| :---- | ----- | ----- |

Columns

| Key | Name | Data Type | Max Length | Nullability | Identity | Default |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| PK | category | TEXT |  \-  | NOT NULL | 1 \- 1 |  \-  |

| 2.3 \[opt\_region\] |  |  |
| :---- | ----- | ----- |

Columns

| Key | Name | Data Type | Max Length | Nullability | Identity | Default |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| PK | region | TEXT |  \-  | NOT NULL | 1 \- 1 |  \-  |

| 2.4 \[opt\_role\] |  |  |
| :---- | ----- | ----- |

Columns

| Key | Name | Data Type | Max Length | Nullability | Identity | Default |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| PK | role | TEXT |  \-  | NOT NULL | 1 \- 1 |  \-  |

| 2.5 \[schedules\] |  |  |
| :---- | ----- | ----- |

Columns

| Key | Name | Data Type | Max Length | Nullability | Identity | Default |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| PK | id | INTEGER |  \-  | NULL | 1 \- 1 | Auto-Increment |
| FK | user\_id | INTEGER |  \-  | NOT NULL |  \-  |  \-  |
|  | effective\_date | TEXT |  \-  | NOT NULL |  \-  |  CURRENT\_TIMESTAMP |
|  | utc\_offset | INTEGER |  \-  | NOT NULL |  \-  | 8 |
|  | local\_offset | INTEGER |  \-  | NOT NULL |  \-  |  8  |
|  | clock\_dur\_min | INTEGER |  \-  | NOT NULL |  \-  | 540 |
|  | lunch\_dur\_min | INTEGER |  \-  | NOT NULL |  \-  | 60 |
|  | break\_dur\_min | INTEGER |  \-  | NOT NULL |  \-  | 15 |
|  | clock\_at | TEXT |  \-  | NULL |  \-  | 00:00 |
|  | first\_break\_at | TEXT |  \-  | NULL |  \-  | 00:00 |
|  | lunch\_at | TEXT |  \-  | NULL |  \-  | 00:00 |
|  | second\_break\_at | TEXT |  \-  | NULL |  \-  | 00:00 |
|  | day\_off | TEXT | 50 | NULL |  \-  |  \-  |
|  | created\_at | TEXT |  \-  | NOT NULL |  \-  | CURRENT\_TIMESTAMP |

Foreign Keys

| Name | Columns |
| :---- | :---- |
| schedules.user\_id | users.id |

Indexes

| Name | Columns | Description |
| :---- | :---- | :---- |
| schedules\_idx | effective\_date, user\_id | Enhances query performance for retrieving schedules by date and user. This is beneficial for daily or weekly schedule views. |

| 2.6 \[sessions\] |  |  |
| :---- | ----- | ----- |

Columns

| Key | Name | Data Type | Max Length | Nullability | Identity | Default |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| PK | id | TEXT |  \-  | NOT NULL |  \-  |  \-  |
| FK | user\_id | INT |  \-  | NOT NULL |  \-  |  \-  |
|  | expires\_at | INT |  \-  | NOT NULL |  \-  |  \-  |

Foreign Keys

| Name | Columns |
| :---- | :---- |
| sessions.user\_id | users.id |

Indexes

| Name | Columns | Description |
| :---- | :---- | :---- |
| idx\_sessions | user\_id | Speeds up lookups for session management by user\_id. Useful for checking active sessions of users. |

| 2.7 \[time\_entries\] |  |  |
| :---- | ----- | ----- |

Columns

| Key | Name | Data Type | Max Length | Nullability | Identity | Default |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| PK | id | INTEGER |  \-  | NULL | 1 \- 1 | AUTO-INCREMENT |
| FK | user\_id | INTEGER |  \-  | NOT NULL |  \-  |  \-  |
| FK | sched\_id | INTEGER |  \-  | NOT NULL |  \-  |  \-  |
| FK | category | TEXT |  \-  | NOT NULL |  \-  |  \-  |
|  | date\_at | TEXT |  \-  | NOT NULL |  \-  |  \-  |
|  | start\_at | INTEGER |  \-  | NOT NULL |  \-  | (unixepoch()) |
|  | end\_at | INTEGER |  \-  | NULL |  \-  |  |
|  | user\_ip | TEXT |  \-  | NULL |  \-  |  \-  |
|  | user\_agent | TEXT |  \-  | NULL |  \-  |  \-  |
|  | remarks | TEXT |  \-  | NULL |  \-  |  \-  |
|  | created\_at | TEXT |  \-  | NOT NULL |  \-  | CURRENT\_TIMESTAMP |
|  | updated\_at | TEXT |  \-  | NOT NULL |  \-  | CURRENT\_TIMESTAMP |

Foreign Keys

| Name | Columns |
| :---- | :---- |
| time\_entries.user\_id | users.id |
| time\_entries.sched\_id | schedules.id |
| time\_entries.category | opt\_category.category |

Indexes

| Name | Columns | Description |
| :---- | :---- | :---- |
| entry\_idx | user\_id, date\_at, category | Optimizes queries that filter by user\_id, date\_at, and category. Useful for tracking time entries by date and category. |

Triggers

| Name | Timing | Event | Condition | Action |
| :---- | :---- | :---- | :---- | :---- |
| time\_entries\_updated | AFTER UPDATE | UPDATE | old.updated\_at \<\> CURRENT\_TIMESTAMP | Updates the updated\_at field to the current timestamp when the entry is modified. |

| 2.8 \[users\] |  |  |
| :---- | ----- | ----- |

Columns

| Key | Name | Data Type | Nullability | Identity | Default |
| :---- | :---- | :---- | :---- | :---- | :---- |
| PK | id | INTEGER | NULL | 1 \- 1 | AUTO-INCREMENT |
| FK | active | INTEGER | NOT NULL |  \-  | 1 |
|  | name | TEXT | NOT NULL |  \-  |  \-  |
| FK | region | TEXT | NULL |  \-  |  \-  |
| FK | role | TEXT | NOT NULL |  \-  | user |
|  | password\_hash | TEXT | NOT NULL |  \-  |  |
|  | lead\_id | INTEGER | NULL |  \-  |  \-  |
|  | lock\_password | INTEGER | NOT NULL |  \-  | 0 |
|  | created\_at | TEXT | NOT NULL |  \-  | CURRENT\_TIMESTAMP |
|  | updated\_at | TEXT | NOT NULL |  \-  | CURRENT\_TIMESTAMP  |
|  | preferences | TEXT | NULL |  | JSON |

Foreign Keys

| Name | Columns |
| :---- | :---- |
| users.lead\_id | users.id |
| users.region | opt\_region.region |
| users.role | opt\_role.role |

Indexes

| Name | Columns | Description |
| :---- | :---- | :---- |
| idx\_users\_leads | lead\_id, region, active | Improves performance for queries filtering by lead\_id, region, and active. Useful for managerial views and retrieving users under specific leads within regions. |
| idx\_users\_roles | role, region, active | Speeds up queries filtering by role, region, and active. This is beneficial for role-based access and views. |
| idx\_users\_regions | region, active | Optimizes queries that filter users by region and active status. This helps in retrieving active users within a specific region. |

Triggers

| Name | Timing | Event | Condition | Action |
| :---- | :---- | :---- | :---- | :---- |
| users\_updated | AFTER UPDATE | UPDATE | old.updated\_at \<\> CURRENT\_TIMESTAMP | Updates the updated\_at field to the current timestamp when the record is modified. |
| fts\_user\_insert | AFTER INSERT | INSERT |  \-  | Inserts the new user's name into the fts\_users table for full-text search. |
| fts\_user\_delete | AFTER DELETE | DELETE |  \-  | Deletes the corresponding entry from fts\_users when a user is removed. |
| fts\_user\_update | AFTER UPDATE | UPDATE | old.name \<\> new.name | Updates the fts\_users table when the user's name changes, maintaining accurate full-text search. |

