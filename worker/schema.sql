CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  google_sub TEXT UNIQUE,
  display_name TEXT,
  created_at INTEGER NOT NULL
);

-- NULL display_name means "never set"; the email local part is shown instead.
CREATE UNIQUE INDEX IF NOT EXISTS users_display_name_unique
  ON users(display_name COLLATE NOCASE)
  WHERE display_name IS NOT NULL;

-- One JSON doc per user, same shape the gist sync already uses.
CREATE TABLE IF NOT EXISTS user_data (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  doc TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Single row per friendship; user_id is the requester. status 'accepted' means mutual.
CREATE TABLE IF NOT EXISTS friends (
  user_id INTEGER NOT NULL REFERENCES users(id),
  friend_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, friend_id)
);

-- Fixed-window counters for auth rate limits (key → count since window_start).
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS movies (
  tmdb_id INTEGER PRIMARY KEY,
  doc TEXT NOT NULL,
  poster_path TEXT,
  fetched_at INTEGER NOT NULL,
  refreshed_at INTEGER
);

CREATE INDEX IF NOT EXISTS movies_fetched_at ON movies(fetched_at);

CREATE TABLE IF NOT EXISTS invite_codes (
  code_hash TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  used_at INTEGER,
  used_by_user_id INTEGER REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS invite_codes_unused ON invite_codes(used_at) WHERE used_at IS NULL;

CREATE TABLE IF NOT EXISTS sessions (
  jti TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS friend_share_links (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  token_hash TEXT NOT NULL UNIQUE,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  jti TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_sessions_expires_at ON admin_sessions(expires_at);
