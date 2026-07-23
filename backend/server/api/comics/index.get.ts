import { getDb, getDataDir } from "../../utils/db";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Math.max(1, parseInt(String(query.page || "1"), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || "24"), 10)));
  const search = String(query.search || "").trim();
  const publisher = String(query.publisher || "").trim();
  const sort = String(query.sort || "created_at").trim();

  const db = getDb();
  const offset = (page - 1) * limit;

  let whereClause = "";
  const params: any[] = [];

  if (search) {
    whereClause = "WHERE (title LIKE ? OR file_name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  if (publisher) {
    whereClause += whereClause ? " AND publisher = ?" : "WHERE publisher = ?";
    params.push(publisher);
  }

  // Whitelist sort columns to prevent injection
  const allowedSorts = ["title", "created_at", "updated_at", "year", "publisher", "issue_number"];
  const sortCol = allowedSorts.includes(sort) ? sort : "created_at";

  const countRow = db.prepare(`SELECT COUNT(*) as total FROM comics ${whereClause}`).get(...params) as any;
  const total = countRow?.total || 0;

  const rows = db.prepare(`
    SELECT id, file_path, file_name, cover_path, title, issue_number,
           volume, year, publisher, page_count, slug, metadata_json, created_at, updated_at
    FROM comics
    ${whereClause}
    ORDER BY ${sortCol} DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const staleDelete = db.prepare("DELETE FROM comics WHERE id = ?");
  const dataDir = getDataDir();

  const comics = rows
    .map((row: any) => {
      // Resolve physical path and check file exists
      let physicalPath: string = row.file_path;
      if (!physicalPath.startsWith("/")) {
        physicalPath = resolve(dataDir, "..", physicalPath);
      }
      if (!existsSync(physicalPath)) {
        // Stale record — file deleted from disk, remove from DB
        staleDelete.run(row.id);
        return null;
      }
      return {
        ...row,
        metadata: safeJsonParse(row.metadata_json),
        metadata_json: undefined,
      };
    })
    .filter(Boolean);

  return {
    comics,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
});

function safeJsonParse(str: string): any {
  try { return JSON.parse(str); } catch { return {}; }
}
