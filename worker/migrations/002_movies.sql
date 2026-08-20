CREATE TABLE IF NOT EXISTS movies (
  tmdb_id INTEGER PRIMARY KEY,
  doc TEXT NOT NULL,
  poster_path TEXT,
  fetched_at INTEGER NOT NULL,
  refreshed_at INTEGER
);

CREATE INDEX IF NOT EXISTS movies_fetched_at ON movies(fetched_at);
