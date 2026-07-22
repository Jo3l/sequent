import { getRouterParam } from "h3";
import { getDb } from "../../../utils/db";
import { readFileSync } from "node:fs";
import { searchVolumes, searchIssues, computePHash, searchCoversByHash, getIssue } from "../../../utils/localCvDb";
import { parseFilename } from "../../../utils/filenameParser";

/**
 * GET /api/comics/:id/suggestions
 * Search local CV DB for potential matches for a comic.
 * Uses filename matching + optional cover hash matching.
 */
export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });

  const db = getDb();
  const comic = db.prepare("SELECT id, file_name, file_path, cover_path, title, issue_number, volume, year FROM comics WHERE id = ?").get(id) as any;
  if (!comic) throw createError({ statusCode: 404, statusMessage: "Comic not found" });

  const parsed = parseFilename(comic.file_name);
  const seriesName = comic.title && comic.title !== parsed.raw ? comic.title : parsed.title;
  const issueNumber = comic.issue_number || parsed.issueNumber;
  const year = comic.year || parsed.year;

  const candidates: Array<{
    issue_id: number;
    name: string;
    issue_number: string;
    volume_name: string;
    publisher_name: string;
    cover_date: string;
    description: string;
    image_url: string;
    match_type: string;
    score: number;
  }> = [];

  const seen = new Set<number>();

  // ── Filename-based candidates ──────────────────────────────────────────
  const volumes = searchVolumes(seriesName);
  if (volumes.length > 0) {
    // Score and rank volumes
    const scored = volumes.map(v => {
      const bookWords = sanitize(seriesName).split(" ").filter(Boolean);
      const seriesWords = sanitize(v.name).split(" ").filter(Boolean);
      const remaining = [...seriesWords];
      let score = 0;
      for (const w of bookWords) {
        const idx = remaining.indexOf(w);
        if (idx !== -1) { score += 5; remaining.splice(idx, 1); }
        else { score -= 3; }
      }
      score -= remaining.length * 3;
      return { volume: v, score };
    }).sort((a, b) => b.score - a.score);

    // Get issues from top matches
    const topVolumes = scored.slice(0, 8);
    for (const sv of topVolumes) {
      const issues = searchIssues([sv.volume.id], issueNumber, year);
      for (const issue of issues) {
        if (seen.has(issue.id)) continue;
        seen.add(issue.id);
        candidates.push({
          issue_id: issue.id,
          name: issue.name || issue.volume_name,
          issue_number: issue.issue_number,
          volume_name: issue.volume_name,
          publisher_name: issue.publisher_name,
          cover_date: issue.cover_date,
          description: issue.description,
          image_url: issue.image_url,
          match_type: "filename",
          score: sv.score,
        });
      }
    }
  }

  // ── Cover hash candidates ──────────────────────────────────────────────
  if (comic.cover_path) {
    try {
      const coverBuf = readFileSync(comic.cover_path);
      const phash = await computePHash(coverBuf);
      const cvids = searchCoversByHash(phash);
      for (const cvid of cvids.slice(0, 10)) {
        if (seen.has(cvid)) continue;
        seen.add(cvid);
        const issue = getIssue(cvid);
        if (issue) {
          candidates.push({
            issue_id: issue.id,
            name: issue.name || issue.volume_name,
            issue_number: issue.issue_number,
            volume_name: issue.volume_name,
            publisher_name: issue.publisher_name,
            cover_date: issue.cover_date,
            description: issue.description,
            image_url: issue.image_url,
            match_type: "hash",
            score: 80,
          });
        }
      }
    } catch { /* hash failed */ }
  }

  return { candidates: candidates.slice(0, 20) };
});

function sanitize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
