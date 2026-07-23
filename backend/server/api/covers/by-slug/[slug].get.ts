import { getRouterParam } from "h3";
import { existsSync, readFileSync } from "node:fs";
import { getDb } from "../../../utils/db";

/**
 * Serve a comic cover by slug (stable across DB rebuilds).
 * GET /api/covers/by-slug/:slug
 *
 * Looks up the comic by its stable slug and serves the cover file
 * directly from disk (the .webp alongside the comic with embedded XMP metadata).
 * No centralized cache — the source of truth is the file next to the comic.
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) throw createError({ statusCode: 400, statusMessage: "Missing slug" });

  const db = getDb();
  const row = db.prepare("SELECT cover_path FROM comics WHERE slug = ?").get(slug) as any;

  if (!row?.cover_path) {
    throw createError({ statusCode: 404, statusMessage: "Cover not found" });
  }

  const coverPath = row.cover_path;
  if (!existsSync(coverPath)) {
    throw createError({ statusCode: 404, statusMessage: "Cover file missing" });
  }

  const ct = coverPath.endsWith(".webp") ? "image/webp"
    : coverPath.endsWith(".png") ? "image/png" : "image/jpeg";
  setHeader(event, "Content-Type", ct);
  setHeader(event, "Cache-Control", "public, max-age=31536000, immutable");
  return readFileSync(coverPath);
});
