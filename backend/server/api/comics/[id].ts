import { getDb } from "../../utils/db";
import { getRouterParam } from "h3";
import { dirname } from "node:path";

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);

  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid comic ID" });
  }

  const db = getDb();
  const row = db.prepare(`
    SELECT id, file_path, file_name, cover_path, title, issue_number,
           volume, year, publisher, page_count, slug, metadata_json, created_at, updated_at
    FROM comics WHERE id = ?
  `).get(id) as any;

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: "Comic not found" });
  }

  // Find next/prev comics in the same directory (alphabetical by file_name)
  const dir = dirname(row.file_path);
  const siblings = db.prepare(
    "SELECT id, file_name FROM comics WHERE file_path LIKE ? ORDER BY file_name COLLATE NOCASE ASC"
  ).all(dir + "/%") as any[];

  let nextId: number | null = null;
  let prevId: number | null = null;
  for (let i = 0; i < siblings.length; i++) {
    if (siblings[i].id === id) {
      if (i > 0) prevId = siblings[i - 1].id;
      if (i < siblings.length - 1) nextId = siblings[i + 1].id;
      break;
    }
  }

  return {
    comic: {
      ...row,
      metadata: JSON.parse(row.metadata_json || "{}"),
      metadata_json: undefined,
    },
    nextId,
    prevId,
  };
});
