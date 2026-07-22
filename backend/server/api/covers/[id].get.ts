import { getRouterParam } from "h3";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getDb, getDataPath } from "../../utils/db";

/**
 * Serve a comic cover by comic ID.
 * GET /api/covers/:id
 *
 * First tries the centralized data/covers/{id}.webp, then falls back to
 * the cover_path stored in the database (alongside the comic file).
 */
export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });

  // Try centralized directory first
  const coversDir = getDataPath("covers");
  for (const ext of ["webp", "jpg", "jpeg", "png"]) {
    const p = resolve(coversDir, `${id}.${ext}`);
    if (existsSync(p)) {
      setHeader(event, "Content-Type", ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");
      setHeader(event, "Cache-Control", "public, max-age=604800, immutable");
      return readFileSync(p);
    }
  }

  // Fall back to cover_path from DB (alongside comic file)
  try {
    const db = getDb();
    const row = db.prepare("SELECT cover_path FROM comics WHERE id = ?").get(id) as any;
    if (row?.cover_path && existsSync(row.cover_path)) {
      const ct = row.cover_path.endsWith(".webp") ? "image/webp"
        : row.cover_path.endsWith(".png") ? "image/png" : "image/jpeg";
      setHeader(event, "Content-Type", ct);
      setHeader(event, "Cache-Control", "public, max-age=604800, immutable");
      return readFileSync(row.cover_path);
    }
  } catch { /* ignore */ }

  throw createError({ statusCode: 404, statusMessage: "Cover not found" });
});
