CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  google_sub TEXT UNIQUE,
  display_name TEXT,
  created_at INTEGER NOT NULL
);

-- One JSON doc per user, same shape the gist sync already uses.
CREATE TABLE IF NOT EXISTS user_data (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  doc TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Fixed-window auth throttling. One row per throttled key (an address, or an
-- address plus email), reused across windows rather than appended per attempt.
CREATE TABLE IF NOT EXISTS auth_attempts (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);

-- Single row per friendship; user_id is the requester. status 'accepted' means mutual.
CREATE TABLE IF NOT EXISTS friends (
  user_id INTEGER NOT NULL REFERENCES users(id),
  friend_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, friend_id)
);
