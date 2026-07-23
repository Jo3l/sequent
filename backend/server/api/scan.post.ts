import { getDb, getDataDir, getDataPath } from "../utils/db";
import { existsSync, statSync } from "node:fs";
import { resolve, join, relative, extname } from "node:path";
import { readdirSync } from "node:fs";
import { isComicFile, getArchiveType, getComicInfo, extractFirstPageImage, listArchiveImages, countPdfPages } from "../utils/comicArchive";
import { generateCover, coverPathFor, readCoverMetadata } from "../utils/comicCover";
import { parseFilename } from "../utils/filenameParser";
import { matchByFilename, computePHash, matchIssueByCoverHash, getIssue, searchVolumes, sanitizeTitle } from "../utils/localCvDb";
import type { CvIssue } from "../utils/localCvDb";
import { slugify } from "../utils/slugify";
import { createJob, updateJob, finishJob, failJob, getJob } from "../utils/scanState";
import type { ScanStats } from "../utils/scanState";
import { mountSmbShare, unmountSmbShare } from "../utils/samba";
import type { SmbMount } from "../utils/samba";

function countPages(physicalPath: string): number {
  const archiveType = getArchiveType(physicalPath);
  if (archiveType === "pdf") return countPdfPages(physicalPath);
  const pages = listArchiveImages(physicalPath);
  return pages.length;
}

function isGenericIssueName(name: string | null | undefined): boolean {
  if (!name) return true;
  const n = name.trim().toLowerCase();
  return /^(vol(?:ume)?\.?\s*\d+|tpb|collected\s*edition|hc|sc|gn|omnibus)$/i.test(n);
}

let jobCount = 0; // used to yield event loop during scan

export default defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery(event);
  const force = query.force === "true" || query.force === "1";

  const library = db.prepare("SELECT * FROM library_folders WHERE active = 1").all() as SmbMount[];
  if (library.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "No library folders configured. Add one in admin settings." });
  }

  // Create job and return immediately — scan runs in background
  const jobId = `scan-${Date.now()}`;
  createJob(jobId, library.length);

  // Run scan asynchronously after returning response, with a small delay
  // so the event loop can process the status-polling requests
  setTimeout(async () => {
    // Yield once more so polling requests can get through before sync ops start
    await new Promise(r => setTimeout(r, 50));

    const coversDir = getDataPath("covers");
    const { mkdirSync } = await import("node:fs");
    mkdirSync(coversDir, { recursive: true });

    for (let fi = 0; fi < library.length; fi++) {
      const folder = library[fi];
      updateJob({ folderIndex: fi, folderLabel: folder.label || folder.path });

      try {
        let scanPath: string = folder.path;

        if (folder.type === "smb" && folder.smb_host) {
          try {
            scanPath = mountSmbShare(folder);
          } catch (e: any) {
            updateJob({ phase: `Error mounting ${folder.label}` });
            const job = getJob();
            if (job) job.stats.errors.push(`Failed to mount ${folder.label}: ${e.message}`);
            continue;
          }
        }

        if (folder.type === "local" && (scanPath.startsWith("./") || scanPath.startsWith("../"))) {
          scanPath = resolve(getDataDir(), "..", scanPath);
        }

        if (!existsSync(scanPath)) {
          updateJob({ phase: `Path not found: ${folder.label}` });
          const job = getJob();
          if (job) job.stats.errors.push(`Path not found: ${scanPath}`);
          continue;
        }

        await scanDirectory(scanPath, folder.path, db, coversDir, force);

        const job = getJob();
        if (job) {
          job.stats.foldersScanned++;
          updateJob({ stats: { ...job.stats } });
        }

        if (folder.type === "smb") {
          unmountSmbShare(folder);
        }
      } catch (e: any) {
        const job = getJob();
        if (job) job.stats.errors.push(`Error scanning ${folder.label}: ${e.message}`);
      }
    }

    finishJob();
  });

  return { success: true, jobId };
});

async function scanDirectory(
  physicalPath: string,
  logicalPath: string,
  db: ReturnType<typeof getDb>,
  coversDir: string,
  force: boolean,
): Promise<void> {
  try {
    const entries = readdirSync(physicalPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPhysical = join(physicalPath, entry.name);
      const fullLogical = join(logicalPath, entry.name);

      if (entry.isDirectory()) {
        await scanDirectory(fullPhysical, fullLogical, db, coversDir, force);
        continue;
      }

      if (!isComicFile(entry.name)) continue;

      updateJob({ phase: `Processing ${entry.name}` });

      // Yield to event loop every few files so status polling works
      if (jobCount++ % 3 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }

      const job = getJob();
      if (job) {
        job.stats.filesFound++;
        updateJob({ stats: { ...job.stats } });
      }

      try {
        const stat = statSync(fullPhysical);

        const coverFile = coverPathFor(fullPhysical);
        if (!force && existsSync(coverFile)) {
          const existing = db.prepare("SELECT id FROM comics WHERE file_path = ?").get(fullLogical) as any;
          if (!existing) {
            const pageCount = countPages(fullPhysical);
            const meta = await readCoverMetadata(coverFile);
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
            const j = getJob();
            if (j) { j.stats.newComics++; updateJob({ stats: { ...j.stats } }); }
          }
          continue;
        }

        const existing = db.prepare("SELECT id, cover_path, updated_at FROM comics WHERE file_path = ?").get(fullLogical) as any;
        await processComic(fullPhysical, fullLogical, db, coversDir, existing?.id);
      } catch (e: any) {
        const job = getJob();
        if (job) job.stats.errors.push(`Error processing ${entry.name}: ${e.message}`);
      }
    }
  } catch (e: any) {
    const job = getJob();
    if (job) job.stats.errors.push(`Cannot read directory: ${e.message}`);
  }
}

async function processComic(
  physicalPath: string,
  logicalPath: string,
  db: ReturnType<typeof getDb>,
  coversDir: string,
  existingId: number | undefined,
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
  let coverBuffer: Buffer | null = null;

  coverBuffer = extractFirstPageImage(physicalPath);
  let isNew = false;

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
    updateJob({ phase: `Generating cover for ${fileName}` });
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

  // Enrich metadata from local CV DB
  const cvResult = matchByFilename(parsed.title, parsed.issueNumber, parsed.year);

  let hashIssue: CvIssue | null = null;
  if (coverBuffer && cvResult) {
    try {
      const phash = await computePHash(coverBuffer);
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

  const archiveType = getArchiveType(physicalPath);
  let pageCount = 0;
  if (archiveType === "pdf") {
    pageCount = countPdfPages(physicalPath);
  } else {
    const pages = listArchiveImages(physicalPath);
    pageCount = pages.length;
  }

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

  const job = getJob();
  if (job) {
    if (isNew) job.stats.newComics++;
    else job.stats.updatedComics++;
    updateJob({ stats: { ...job.stats } });
  }
}
