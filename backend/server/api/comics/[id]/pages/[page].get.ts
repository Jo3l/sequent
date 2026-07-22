import { getDb, getDataPath } from "../../../../utils/db";
import { getRouterParam } from "h3";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve, join } from "node:path";
import { execSync } from "node:child_process";
import { extractImageFromArchive, listArchiveImages, getArchiveType } from "../../../../utils/comicArchive";

const CACHE_DIR = getDataPath("cache");
const CACHE_TTL = 60 * 60 * 1000;

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const rawPage = getRouterParam(event, "page");
  const id = parseInt(rawId || "", 10);
  const pageNum = parseInt(rawPage || "", 10);

  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: "Invalid comic ID" });
  if (isNaN(pageNum) || pageNum < 1) throw createError({ statusCode: 400, statusMessage: "Invalid page number" });

  const db = getDb();
  const comic = db.prepare("SELECT file_path, file_name FROM comics WHERE id = ?").get(id) as any;
  if (!comic) throw createError({ statusCode: 404, statusMessage: "Comic not found" });

  let physicalPath = comic.file_path;
  if (!physicalPath.startsWith("/")) {
    const folders = db.prepare("SELECT path FROM library_folders WHERE active = 1").all() as any[];
    for (const folder of folders) {
      const candidate = join(folder.path, comic.file_path);
      if (existsSync(candidate)) { physicalPath = candidate; break; }
    }
  }

  if (!existsSync(physicalPath)) {
    throw createError({ statusCode: 404, statusMessage: "Comic file not found on disk" });
  }

  const archiveType = getArchiveType(physicalPath);

  if (archiveType === "pdf") {
    return servePdfPage(event, physicalPath, id, pageNum);
  }
  return serveArchivePage(event, physicalPath, id, pageNum);
});

function serveArchivePage(event: any, archivePath: string, comicId: number, pageNum: number) {
  const cacheDir = join(CACHE_DIR, String(comicId));
  mkdirSync(cacheDir, { recursive: true });
  cleanStaleCache(cacheDir);

  const images = listArchiveImages(archivePath);
  const idx = pageNum - 1;
  if (idx < 0 || idx >= images.length) {
    throw createError({ statusCode: 404, statusMessage: `Page ${pageNum} not found (total: ${images.length})` });
  }

  const extracted = extractImageFromArchive(archivePath, images[idx], cacheDir);
  if (!extracted) throw createError({ statusCode: 500, statusMessage: "Failed to extract page" });

  const data = readFileSync(extracted);
  const ext = extracted.split(".").pop()?.toLowerCase() || "jpeg";
  setHeader(event, "Content-Type", getMimeType(ext));
  setHeader(event, "Cache-Control", "public, max-age=86400, immutable");
  return data;
}

async function servePdfPage(event: any, pdfPath: string, comicId: number, pageNum: number) {
  const cacheDir = join(CACHE_DIR, `pdf_${comicId}`);
  mkdirSync(cacheDir, { recursive: true });
  const cacheFile = join(cacheDir, `page_${pageNum}.webp`);

  if (!existsSync(cacheFile)) {
    const prefix = join(cacheDir, `_tmp`);
    try {
      execSync(`pdftoppm -f ${pageNum} -l ${pageNum} -r 200 -png "${pdfPath}" "${prefix}"`, {
        stdio: "pipe", timeout: 15_000,
      });
    } catch {
      throw createError({ statusCode: 500, statusMessage: "PDF render failed. Install poppler-utils: sudo apt install poppler-utils" });
    }

    const generated = join(cacheDir, `_tmp-${pageNum}.png`);
    if (!existsSync(generated)) {
      throw createError({ statusCode: 404, statusMessage: `Page ${pageNum} not found in PDF` });
    }

    try {
      const sharp = await import("sharp");
      const webp = await sharp.default(generated)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      writeFileSync(cacheFile, webp);
      unlinkSync(generated);
    } catch {
      const data = readFileSync(generated);
      setHeader(event, "Content-Type", "image/png");
      setHeader(event, "Cache-Control", "public, max-age=3600");
      unlinkSync(generated);
      return data;
    }
  }

  const data = readFileSync(cacheFile);
  setHeader(event, "Content-Type", "image/webp");
  setHeader(event, "Cache-Control", "public, max-age=3600");
  return data;
}

function getMimeType(ext: string): string {
  const m: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", bmp: "image/bmp", tiff: "image/tiff", tif: "image/tiff" };
  return m[ext] || "image/jpeg";
}

function cleanStaleCache(cacheDir: string): void {
  try {
    const now = Date.now();
    const { readdirSync } = require("node:fs");
    for (const entry of readdirSync(cacheDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const full = join(cacheDir, entry.name);
      try { if (now - statSync(full).mtimeMs > CACHE_TTL) unlinkSync(full); } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
}
