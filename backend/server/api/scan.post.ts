import { getDb } from "../utils/db";
import { existsSync, statSync } from "node:fs";
import { resolve, join, relative, extname } from "node:path";
import { readdirSync } from "node:fs";
import { isComicFile, getArchiveType, getComicInfo, extractFirstPageImage, listArchiveImages } from "../utils/comicArchive";
import { generateCover, coverPathFor, readCoverMetadata } from "../utils/comicCover";
import { parseFilename } from "../utils/filenameParser";
import { matchByFilename, computePHash, matchIssueByCoverHash, getIssue, searchVolumes, sanitizeTitle } from "../utils/localCvDb";
import type { CvIssue } from "../utils/localCvDb";
import { slugify } from "../utils/slugify";

function countPages(physicalPath: string): number {
  const archiveType = getArchiveType(physicalPath);
  if (archiveType === "pdf") return 0;
  const pages = listArchiveImages(physicalPath);
  return pages.length;
}

/** Generic issue names that shouldn't be used as comic titles. */
function isGenericIssueName(name: string | null | undefined): boolean {
  if (!name) return true;
  const n = name.trim().toLowerCase();
  return /^(vol(?:ume)?\.?\s*\d+|tpb|collected\s*edition|hc|sc|gn|omnibus)$/i.test(n);
}
import { mountSmbShare, unmountSmbShare } from "../utils/samba";
import type { SmbMount } from "../utils/samba";

interface ScanStats {
  foldersScanned: number;
  filesFound: number;
  newComics: number;
  updatedComics: number;
  errors: string[];
}

export default defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery(event);
  const force = query.force === "true" || query.force === "1";

  const library = db.prepare("SELECT * FROM library_folders WHERE active = 1").all() as SmbMount[];
  if (library.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "No library folders configured. Add one in admin settings." });
  }

  const stats: ScanStats = {
    foldersScanned: 0,
    filesFound: 0,
    newComics: 0,
    updatedComics: 0,
    errors: [],
  };

  const coversDir = resolve(process.cwd(), "covers");
  const { mkdirSync } = await import("node:fs");
  mkdirSync(coversDir, { recursive: true });

  for (const folder of library) {
    try {
      let scanPath = folder.path;

      // Mount SMB shares if needed
      if (folder.type === "smb" && folder.smb_host) {
        try {
          scanPath = mountSmbShare(folder);
        } catch (e: any) {
          stats.errors.push(`Failed to mount ${folder.label}: ${e.message}`);
          continue;
        }
      }

      if (!existsSync(scanPath)) {
        stats.errors.push(`Path not found: ${scanPath}`);
        continue;
      }

      await scanDirectory(scanPath, folder.path, db, coversDir, stats, force);
      stats.foldersScanned++;

      // Unmount SMB shares after scan
      if (folder.type === "smb") {
        unmountSmbShare(folder);
      }
    } catch (e: any) {
      stats.errors.push(`Error scanning ${folder.label}: ${e.message}`);
    }
  }

  return { success: true, stats };
});

async function scanDirectory(
  physicalPath: string,
  logicalPath: string,
  db: ReturnType<typeof getDb>,
  coversDir: string,
  stats: ScanStats,
  force: boolean,
): Promise<void> {
  try {
    const entries = readdirSync(physicalPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPhysical = join(physicalPath, entry.name);
      const fullLogical = join(logicalPath, entry.name);

      if (entry.isDirectory()) {
        await scanDirectory(fullPhysical, fullLogical, db, coversDir, stats, force);
        continue;
      }

      if (!isComicFile(entry.name)) continue;

      stats.filesFound++;

      try {
        const stat = statSync(fullPhysical);

        // Skip if cover already exists alongside the comic (cached with XMP metadata)
        const coverFile = coverPathFor(fullPhysical);
        if (!force && existsSync(coverFile)) {
          // Ensure DB has this comic tracked
          const existing = db.prepare("SELECT id FROM comics WHERE file_path = ?").get(fullLogical) as any;
          if (!existing) {
            // New comic with pre-existing cover — insert minimal record
            const pageCount = countPages(fullPhysical);
            const meta = readCoverMetadata(coverFile);
            const parsed = parseFilename(entry.name);
            db.prepare(`
              INSERT INTO comics (file_path, file_name, cover_path, title, issue_number,
                volume, year, publisher, page_count, metadata_json, slug)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(fullLogical, entry.name, coverFile,
              meta?.title || parsed.title,
              meta?.number || parsed.issueNumber || "",
              meta?.volume || parsed.volume || "",
              meta?.year || parsed.year || "",
              meta?.publisher || "",
              pageCount,
              JSON.stringify(meta || {}),
              slugify(meta?.title || parsed.title, meta?.number || parsed.issueNumber));
            stats.newComics++;
          }
          continue;
        }

        const existing = db.prepare("SELECT id, cover_path, updated_at FROM comics WHERE file_path = ?").get(fullLogical) as any;

        await processComic(fullPhysical, fullLogical, db, coversDir, existing?.id, stats);
      } catch (e: any) {
        stats.errors.push(`Error processing ${entry.name}: ${e.message}`);
      }
    }
  } catch (e: any) {
    stats.errors.push(`Cannot read directory: ${e.message}`);
  }
}

async function processComic(
  physicalPath: string,
  logicalPath: string,
  db: ReturnType<typeof getDb>,
  coversDir: string,
  existingId: number | undefined,
  stats: ScanStats,
): Promise<void> {
  const fileName = physicalPath.split("/").pop() || logicalPath;
  const parsed = parseFilename(fileName);

  // Try ComicInfo.xml first
  let metadata: any = {};
  const comicInfo = await getComicInfo(physicalPath);
  if (comicInfo) {
    metadata = {
      title: comicInfo.title || comicInfo.series || parsed.title,
      issue_number: comicInfo.number || parsed.issueNumber,
      volume: comicInfo.volume || parsed.volume,
      year: comicInfo.year || parsed.year,
      publisher: comicInfo.publisher || "",
      summary: comicInfo.summary || "",
      writer: comicInfo.writer || "",
    };
  }

  // Extract cover — for new comics, insert first to get real ID, then generate cover
  let coverPath = "";
  const coverBuffer = extractFirstPageImage(physicalPath);
  let isNew = false;

  // For NEW comics: insert first, get real ID, then generate cover
  if (!existingId) {
    const pageCount = countPages(physicalPath);
    const result = db.prepare(`
      INSERT INTO comics (file_path, file_name, cover_path, title, issue_number,
        volume, year, publisher, page_count, metadata_json, slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logicalPath, fileName, "", parsed.title,
      parsed.issueNumber || "", parsed.volume || "",
      parsed.year || "", "", pageCount, "{}",
      slugify(parsed.title, parsed.issueNumber));
    existingId = result.lastInsertRowid as number;
    isNew = true;
  }

  if (coverBuffer) {
    const coverFile = coverPathFor(physicalPath);
    const success = await generateCover(coverBuffer, {
      title: metadata.title || parsed.title,
      series: metadata.title || parsed.title,
      number: metadata.issue_number || parsed.issueNumber,
      volume: metadata.volume || parsed.volume,
      publisher: metadata.publisher,
      year: metadata.year || parsed.year,
      summary: metadata.summary,
      writer: metadata.writer,
    }, coverFile);
    if (success) coverPath = coverFile;
  }

  // Enrich metadata from local CV DB (filename + cover hash across all issues)
  const cvResult = matchByFilename(parsed.title, parsed.issueNumber, parsed.year);

  // If we have matching volumes AND a cover, try hash matching across ALL their issues.
  // This catches cases where the file is named #1 but the cover matches issue #0.
  let hashIssue: CvIssue | null = null;
  if (coverBuffer && cvResult) {
    try {
      const phash = await computePHash(coverBuffer);
      // Get the volume IDs from the matched volumes (via cvResult's issue volume_id)
      // But we need ALL candidate volume IDs. Use the same scoring as matchByFilename.
      const volumes = searchVolumes(parsed.title);
      if (volumes.length > 0) {
        const scored = volumes
          .map((v) => {
            const bookWords = sanitizeTitle(parsed.title).split(" ").filter(Boolean);
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
            return { volume: v, ratio: (score - minScore) / (maxScore - minScore) };
          })
          .filter(s => s.ratio >= 0.5)
          .sort((a, b) => b.ratio - a.ratio);

        if (scored.length > 0) {
          const bestRatio = scored[0].ratio;
          const topIds = scored
            .filter(s => s.ratio >= bestRatio - 0.1)
            .slice(0, 5)
            .map(s => s.volume.id);
          hashIssue = matchIssueByCoverHash(phash, topIds);
        }
      }
    } catch { /* pHash failed */ }
  }

  if (hashIssue) {
    // Hash match found — use it (more reliable than filename-based issue number)
    metadata = {
      title: metadata.title || hashIssue.volume_name || parsed.title,
      issue_number: hashIssue.issue_number || metadata.issue_number || parsed.issueNumber,
      volume: hashIssue.volume_name || metadata.volume || "",
      publisher: hashIssue.publisher_name || metadata.publisher || "",
      year: hashIssue.cover_date ? hashIssue.cover_date.slice(0, 4) : metadata.year || parsed.year || "",
      summary: metadata.summary || hashIssue.description || "",
      cv_id: hashIssue.id,
      cv_volume_name: hashIssue.volume_name,
      cv_cover_date: hashIssue.cover_date,
      cv_url: hashIssue.site_detail_url,
      cv_cover_url: hashIssue.image_url,
      cv_description: hashIssue.description,
      cv_person_credits: hashIssue.person_credits,
      cv_character_credits: hashIssue.character_credits,
      cv_story_arc_credits: hashIssue.story_arc_credits,
      cv_match_method: "hash",
    };
  } else if (cvResult) {
    // No hash match — use filename-based match
    const i = cvResult.issue;
    const cvTitle = i.volume_name || (isGenericIssueName(i.name) ? "" : i.name);
    metadata = {
      title: metadata.title || cvTitle || parsed.title,
      issue_number: metadata.issue_number || i.issue_number || parsed.issueNumber,
      volume: metadata.volume || i.volume_name || "",
      publisher: metadata.publisher || i.publisher_name || "",
      year: metadata.year || (i.cover_date ? i.cover_date.slice(0, 4) : parsed.year) || "",
      summary: metadata.summary || i.description || "",
      cv_id: i.id,
      cv_volume_name: i.volume_name,
      cv_cover_date: i.cover_date,
      cv_url: i.site_detail_url,
      cv_cover_url: i.image_url,
      cv_description: i.description,
      cv_person_credits: i.person_credits,
      cv_character_credits: i.character_credits,
      cv_story_arc_credits: i.story_arc_credits,
      cv_match_method: cvResult.method,
    };
  }

  // Get page count
  const archiveType = getArchiveType(physicalPath);
  let pageCount = 0;
  if (archiveType !== "pdf") {
    const pages = listArchiveImages(physicalPath);
    pageCount = pages.length;
  }

  // Update with full metadata and cover path (for both new and existing)
  const metadataJson = JSON.stringify(metadata);
  const slug = slugify(metadata.title || parsed.title, metadata.issue_number || parsed.issueNumber);
  db.prepare(`
    UPDATE comics SET
      file_name = ?, cover_path = ?, title = ?, issue_number = ?,
      volume = ?, year = ?, publisher = ?, page_count = ?,
      metadata_json = ?, slug = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(fileName, coverPath, metadata.title || parsed.title,
    metadata.issue_number || parsed.issueNumber, metadata.volume || parsed.volume || "",
    metadata.year || parsed.year || "", metadata.publisher || "",
    pageCount, metadataJson, slug, existingId);
  if (isNew) stats.newComics++;
  else stats.updatedComics++;
}
