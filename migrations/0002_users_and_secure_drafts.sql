CREATE TABLE IF NOT EXISTS resume_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_resume_drafts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  encrypted_payload TEXT NOT NULL,
  payload_iv TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES resume_users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_resume_drafts_user_updated
  ON user_resume_drafts(user_id, updated_at DESC);
