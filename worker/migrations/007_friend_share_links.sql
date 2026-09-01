CREATE TABLE IF NOT EXISTS friend_share_links (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  token_hash TEXT NOT NULL UNIQUE,
  updated_at INTEGER NOT NULL
);
