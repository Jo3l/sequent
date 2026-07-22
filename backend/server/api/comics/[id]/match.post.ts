import { getRouterParam } from "h3";
import { getDb } from "../../../utils/db";
import { getIssue } from "../../../utils/localCvDb";
import { slugify } from "../../../utils/slugify";

/**
 * POST /api/comics/:id/match
 * Apply a manual CV match to a comic. Body: { cv_issue_id: number }
 */
export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });

  const body = await readBody(event);
  const cvIssueId = parseInt(String(body?.cv_issue_id || ""), 10);
  if (isNaN(cvIssueId)) throw createError({ statusCode: 400, statusMessage: "cv_issue_id required" });

  const cvIssue = getIssue(cvIssueId);
  if (!cvIssue) throw createError({ statusCode: 404, statusMessage: "CV issue not found" });

  const db = getDb();
  const comic = db.prepare("SELECT id, title, issue_number, metadata_json FROM comics WHERE id = ?").get(id) as any;
  if (!comic) throw createError({ statusCode: 404, statusMessage: "Comic not found" });

  // Merge CV metadata
  const existingMeta = JSON.parse(comic.metadata_json || "{}");
  const cvTitle = cvIssue.volume_name || cvIssue.name || "";

  const meta = {
    ...existingMeta,
    title: cvTitle || existingMeta.title,
    issue_number: cvIssue.issue_number || existingMeta.issue_number,
    volume: cvIssue.volume_name || existingMeta.volume,
    publisher: cvIssue.publisher_name || existingMeta.publisher,
    year: cvIssue.cover_date ? cvIssue.cover_date.slice(0, 4) : existingMeta.year,
    summary: cvIssue.description || existingMeta.summary,
    cv_id: cvIssue.id,
    cv_volume_name: cvIssue.volume_name,
    cv_cover_date: cvIssue.cover_date,
    cv_url: cvIssue.site_detail_url,
    cv_cover_url: cvIssue.image_url,
    cv_description: cvIssue.description,
    cv_person_credits: cvIssue.person_credits,
    cv_character_credits: cvIssue.character_credits,
    cv_story_arc_credits: cvIssue.story_arc_credits,
    cv_match_method: "manual",
  };

  const slug = slugify(cvTitle, cvIssue.issue_number);

  db.prepare(`
    UPDATE comics SET
      title = ?, issue_number = ?, volume = ?, publisher = ?, year = ?,
      metadata_json = ?, slug = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    cvTitle,
    cvIssue.issue_number || existingMeta.issue_number || "",
    cvIssue.volume_name || existingMeta.volume || "",
    cvIssue.publisher_name || existingMeta.publisher || "",
    cvIssue.cover_date ? cvIssue.cover_date.slice(0, 4) : existingMeta.year || "",
    JSON.stringify(meta),
    slug,
    id,
  );

  return { ok: true, comic: { ...comic, title: cvTitle, slug, metadata: meta } };
});
