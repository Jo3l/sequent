/**
 * Local Comic Vine database integration.
 *
 * Uses the localcvdb SQLite file produced by ComicTagger/Comic Vine Scraper.
 * Schema: cv_issue, cv_volume, cv_publisher, comic_files (hashes), comic_covers (hashes).
 * FTS search via volume_fts for fuzzy name matching.
 */
import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// ── DB connection ────────────────────────────────────────────────────────────

function getDefaultDbPath(): string {
  const cwd = process.cwd();
  const candidates = [
    resolve(cwd, "../localcvdb/localcvdb_20260109/localcv.db"),
    resolve(cwd, "../../localcvdb/localcvdb_20260109/localcv.db"),
    resolve(cwd, "localcvdb/localcvdb_20260109/localcv.db"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return candidates[0];
}

const DEFAULT_DB_PATH = getDefaultDbPath();
let _cvDb: Database.Database | null = null;

function getCvDb(): Database.Database | null {
  if (_cvDb) return _cvDb;
  const dbPath = process.env.LOCALCVDB_PATH || DEFAULT_DB_PATH;
  if (!existsSync(dbPath)) return null;
  try {
    _cvDb = new Database(dbPath, { readonly: true });
    return _cvDb;
  } catch {
    return null;
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface CvIssue {
  id: number;
  name: string;
  issue_number: string;
  volume_id: number;
  volume_name: string;
  publisher_name: string;
  cover_date: string;
  image_url: string;
  description: string;
  site_detail_url: string;
  /** JSON arrays from localcvdb */
  person_credits?: string;
  character_credits?: string;
  story_arc_credits?: string;
}

// ── Text matching helpers ────────────────────────────────────────────────────

const ARTICLES = new Set(["the", "a", "an", "and", "of", "for", "in", "on", "at", "to", "by", "with", "is", "it", "its"]);

export function sanitizeTitle(title: string): string {
  let s = title.toLowerCase();
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/[^a-z0-9\s]/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s.split(" ").filter((w) => !ARTICLES.has(w)).join(" ");
}

/** Word-by-word scoring like MatchScore. Returns ratio 0–1. */
export function titlesMatch(a: string, b: string, threshold = 0.5): boolean {
  const bookWords = sanitizeTitle(a).split(" ").filter(Boolean);
  const seriesWords = sanitizeTitle(b).split(" ").filter(Boolean);
  if (bookWords.length === 0) return false;
  if (sanitizeTitle(a) === sanitizeTitle(b)) return true;

  const remaining = [...seriesWords];
  let score = 0;
  for (const w of bookWords) {
    const idx = remaining.indexOf(w);
    if (idx !== -1) { score += 5; remaining.splice(idx, 1); }
    else { score -= 3; }
  }
  score -= remaining.length * 3;

  const bookHasAnnual = sanitizeTitle(a).includes("annual");
  const seriesHasAnnual = sanitizeTitle(b).includes("annual");
  if (bookHasAnnual !== seriesHasAnnual) score -= 50;

  const maxScore = bookWords.length * 5 + 50;
  const minScore = -(bookWords.length * 3 + remaining.length * 3 + 50);
  const ratio = (score - minScore) / (maxScore - minScore);
  return ratio >= threshold;
}

/** Build a safe FTS query from a user-facing string. */
function buildFtsQuery(text: string): string {
  // Split into words, dedupe, filter stopwords, wrap each in quotes
  const words = [...new Set(
    text.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 1 && !ARTICLES.has(w))
  )];
  if (words.length === 0) return text.replace(/[^\w\s]/g, " ").trim();
  return words.map(w => `"${w}"`).join(" OR ");
}

// ── Volume search via FTS ────────────────────────────────────────────────────

export function searchVolumes(seriesName: string): Array<{ id: number; name: string; start_year: string; publisher_name: string; count_of_issues: number }> {
  const db = getCvDb();
  if (!db || !seriesName) return [];

  try {
    const ftsQuery = buildFtsQuery(seriesName);
    const rows = db.prepare(`
      SELECT v.id, v.name, v.start_year, p.name as publisher_name, v.count_of_issues
      FROM volume_fts fts
      JOIN cv_volume v ON v.id = fts.rowid
      LEFT JOIN cv_publisher p ON v.publisher_id = p.id
      WHERE volume_fts MATCH ?
      ORDER BY rank
      LIMIT 30
    `).all(ftsQuery) as any[];

    return rows.map((r: any) => ({
      id: r.id,
      name: r.name || "",
      start_year: r.start_year || "",
      publisher_name: r.publisher_name || "",
      count_of_issues: r.count_of_issues || 0,
    }));
  } catch {
    // Fallback to LIKE search
    try {
      const rows = db.prepare(`
        SELECT v.id, v.name, v.start_year, p.name as publisher_name, v.count_of_issues
        FROM cv_volume v
        LEFT JOIN cv_publisher p ON v.publisher_id = p.id
        WHERE v.name LIKE ?
        ORDER BY v.start_year DESC
        LIMIT 30
      `).all(`%${seriesName}%`) as any[];
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name || "",
        start_year: r.start_year || "",
        publisher_name: r.publisher_name || "",
        count_of_issues: r.count_of_issues || 0,
      }));
    } catch {
      return [];
    }
  }
}

// ── Issue search ─────────────────────────────────────────────────────────────

export function searchIssues(volumeIds: number[], issueNumber: string, year?: string): CvIssue[] {
  const db = getCvDb();
  if (!db || volumeIds.length === 0) return [];

  const placeholders = volumeIds.map(() => "?").join(",");
  let query = `
    SELECT i.id, i.name, i.issue_number, i.volume_id, v.name as volume_name,
           p.name as publisher_name, i.cover_date, i.image_url, i.description,
           i.site_detail_url, i.person_credits, i.character_credits, i.story_arc_credits
    FROM cv_issue i
    JOIN cv_volume v ON i.volume_id = v.id
    LEFT JOIN cv_publisher p ON v.publisher_id = p.id
    WHERE i.volume_id IN (${placeholders})
      AND (i.issue_number = ? OR i.issue_number = ?)
  `;
  const params: any[] = [...volumeIds, issueNumber, String(parseFloat(issueNumber) || issueNumber)];

  if (year) {
    query += " ORDER BY ABS(CAST(SUBSTR(i.cover_date,1,4) AS INTEGER) - ?) ASC";
    params.push(parseInt(year, 10));
  }
  query += " LIMIT 20";

  try {
    return db.prepare(query).all(...params) as CvIssue[];
  } catch {
    return [];
  }
}

// ── Hash-based matching ──────────────────────────────────────────────────────

/** Search comic_files by perceptual hash (pHash string like hex). */
export function searchByCoverHash(phashHex: string): Array<{ cvid: number; filename: string }> {
  const db = getCvDb();
  if (!db || !phashHex) return [];

  try {
    return db.prepare(`
      SELECT cvid, filename FROM comic_files
      WHERE ct_phash = ?
      LIMIT 20
    `).all(phashHex) as any[];
  } catch {
    return [];
  }
}

/** Search comic_covers by pHash and return matching cvid. */
export function searchCoversByHash(phashHex: string): number[] {
  const db = getCvDb();
  if (!db || !phashHex) return [];

  try {
    const rows = db.prepare(`
      SELECT DISTINCT cvid FROM comic_covers
      WHERE ct_phash = ?
      LIMIT 20
    `).all(phashHex) as any[];
    return rows.map((r: any) => r.cvid);
  } catch {
    return [];
  }
}

// ── Full issue lookup ────────────────────────────────────────────────────────

export function getIssue(issueId: number): CvIssue | null {
  const db = getCvDb();
  if (!db) return null;

  try {
    const row = db.prepare(`
      SELECT i.id, i.name, i.issue_number, i.volume_id, v.name as volume_name,
             p.name as publisher_name, i.cover_date, i.image_url, i.description,
             i.site_detail_url, i.person_credits, i.character_credits, i.story_arc_credits
      FROM cv_issue i
      JOIN cv_volume v ON i.volume_id = v.id
      LEFT JOIN cv_publisher p ON v.publisher_id = p.id
      WHERE i.id = ?
    `).get(issueId) as any;

    return row || null;
  } catch {
    return null;
  }
}

// ── Filename-based matching pipeline ─────────────────────────────────────────

export interface MatchResult {
  issue: CvIssue;
  /** How it was matched: "filename" | "hash" | "both" */
  method: string;
}

/**
 * Try to match a comic by filename (series + issue number).
 * Returns the best matching issue from local CV DB, or null.
 */
export function matchByFilename(
  seriesName: string,
  issueNumber?: string,
  year?: string,
): MatchResult | null {
  if (!seriesName) return null;

  const volumes = searchVolumes(seriesName);
  if (volumes.length === 0) return null;

  // Score each volume by title match quality
  const scored = volumes
    .map((v) => {
      const bookWords = sanitizeTitle(seriesName).split(" ").filter(Boolean);
      const seriesWords = sanitizeTitle(v.name).split(" ").filter(Boolean);
      const remaining = [...seriesWords];
      let score = 0;
      for (const w of bookWords) {
        const idx = remaining.indexOf(w);
        if (idx !== -1) { score += 5; remaining.splice(idx, 1); }
        else { score -= 3; }
      }
      score -= remaining.length * 3;
      const maxScore = bookWords.length * 5 + 50;
      const minScore = -(bookWords.length * 3 + remaining.length * 3 + 50);
      const ratio = (score - minScore) / (maxScore - minScore);
      return { volume: v, ratio };
    })
    .filter((s) => s.ratio >= 0.5)
    .sort((a, b) => b.ratio - a.ratio);

  if (scored.length === 0) return null;

  // Use only the best-matching volumes (top 5 or those within 10% of best)
  const bestRatio = scored[0].ratio;
  const topVolumes = scored
    .filter((s) => s.ratio >= bestRatio - 0.1)
    .slice(0, 5);

  const volumeIds = topVolumes.map((s) => s.volume.id);
  const issues = issueNumber
    ? searchIssues(volumeIds, issueNumber, year)
    : [];

  if (issues.length === 0) return null;

  return { issue: issues[0], method: "filename" };
}

// ── pHash computation (for cover matching) ───────────────────────────────────

let _sharp: any = null;
async function getSharp() {
  if (!_sharp) { const m = await import("sharp"); _sharp = m.default || m; }
  return _sharp;
}

/** Compute 64-bit perceptual hash as hex string, matching ComicTagger format. */
export async function computePHash(imageBuffer: Buffer): Promise<string> {
  const s = await getSharp();

  // Strip bottom half (back cover)
  const meta = await s(imageBuffer).metadata();
  const topHalf = await s(imageBuffer)
    .extract({ left: 0, top: 0, width: meta.width || 1, height: Math.floor((meta.height || 1) / 2) })
    .toBuffer();

  // 8x8 greyscale
  const pixels = await s(topHalf)
    .resize(8, 8, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer();

  const arr = Array.from(pixels);
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;

  // Build 64-bit → hex string (big-endian, 16 hex chars)
  let hash = BigInt(0);
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > avg) hash |= BigInt(1) << BigInt(i);
  }
  return hash.toString(16).padStart(16, "0");
}

// ── Cover-hash matching across a volume's issues ─────────────────────────────

/**
 * Search for an issue in the given volumes whose cover hash matches.
 * Checks ALL issues in the volumes, not just the filename-derived number.
 * This catches cases where the file is named #1 but the cover matches #0.
 */
export function matchIssueByCoverHash(
  phashHex: string,
  volumeIds: number[],
): CvIssue | null {
  const db = getCvDb();
  if (!db || !phashHex || volumeIds.length === 0) return null;

  const placeholders = volumeIds.map(() => "?").join(",");

  try {
    // Find cvids from comic_covers that match the pHash
    const matchingCvids = db.prepare(`
      SELECT DISTINCT cvid FROM comic_covers
      WHERE ct_phash = ?
      LIMIT 100
    `).all(phashHex) as Array<{ cvid: number }>;

    if (matchingCvids.length === 0) return null;

    const cvidPlaceholders = matchingCvids.map(() => "?").join(",");

    // Join with cv_issue, filter by our volume IDs
    const rows = db.prepare(`
      SELECT i.id, i.name, i.issue_number, i.volume_id, v.name as volume_name,
             p.name as publisher_name, i.cover_date, i.image_url, i.description,
             i.site_detail_url, i.person_credits, i.character_credits, i.story_arc_credits
      FROM cv_issue i
      JOIN cv_volume v ON i.volume_id = v.id
      LEFT JOIN cv_publisher p ON v.publisher_id = p.id
      WHERE i.id IN (${cvidPlaceholders})
        AND i.volume_id IN (${placeholders})
      LIMIT 10
    `).all(...matchingCvids.map(r => r.cvid), ...volumeIds) as CvIssue[];

    return rows[0] || null;
  } catch {
    return null;
  }
}
