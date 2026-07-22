import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

let _db: Database.Database | null = null;

function getDataDir(): string {
  const cwd = process.cwd();
  // Nitro dev: cwd = backend/
  // Nitro prod: cwd = .output/
  if (existsSync(resolve(cwd, "data"))) {
    return resolve(cwd, "data");
  }
  const alt = resolve(cwd, "..", "data");
  if (!existsSync(alt)) mkdirSync(alt, { recursive: true });
  return alt;
}

export function getDb(): Database.Database {
  if (!_db) {
    const dataDir = getDataDir();
    const dbPath = resolve(dataDir, "comics.db");
    _db = new Database(dbPath);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      cover_path TEXT DEFAULT '',
      title TEXT DEFAULT '',
      issue_number TEXT DEFAULT '',
      volume TEXT DEFAULT '',
      year TEXT DEFAULT '',
      publisher TEXT DEFAULT '',
      page_count INTEGER DEFAULT 0,
      metadata_json TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS library_folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      label TEXT DEFAULT '',
      type TEXT DEFAULT 'local' CHECK(type IN ('local', 'smb', 'webdav')),
      smb_host TEXT DEFAULT '',
      smb_share TEXT DEFAULT '',
      smb_username TEXT DEFAULT '',
      smb_password TEXT DEFAULT '',
      smb_domain TEXT DEFAULT '',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
