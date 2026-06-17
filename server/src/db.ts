import Database from 'better-sqlite3';

export const db = new Database('kanjishishou.db');

db.exec(`
CREATE TABLE IF NOT EXISTS backups (
  id TEXT PRIMARY KEY,
  passkey_hash TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
`);
