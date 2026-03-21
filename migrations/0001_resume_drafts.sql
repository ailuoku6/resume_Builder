CREATE TABLE IF NOT EXISTS resume_drafts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resume_drafts_updated_at
  ON resume_drafts(updated_at DESC);
