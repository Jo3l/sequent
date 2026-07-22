import { getDb } from "../../utils/db";
import { getRouterParam } from "h3";

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

  return {
    comic: {
      ...row,
      metadata: JSON.parse(row.metadata_json || "{}"),
      metadata_json: undefined,
    },
  };
});
