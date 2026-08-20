CREATE TABLE IF NOT EXISTS invite_codes (
  code_hash TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  used_at INTEGER,
  used_by_user_id INTEGER REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS invite_codes_unused ON invite_codes(used_at) WHERE used_at IS NULL;
