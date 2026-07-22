/**
 * Database seed script.
 * Creates tables and default settings.
 *
 * Run with: npx tsx server/seed.ts
 */
import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const dataDir = resolve(process.cwd(), "data");
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const dbPath = resolve(dataDir, "comics.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
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

// Insert default settings if not present
const defaultSettings: Record<string, string> = {
  cache_ttl: "3600",
  scan_interval: "0",
  theme: "dark",
};

const upsert = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
for (const [key, value] of Object.entries(defaultSettings)) {
  upsert.run(key, value);
}

console.log("✅ Database seeded successfully at:", dbPath);
db.close();
