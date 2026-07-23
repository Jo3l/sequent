import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface ComicMetadata {
  title?: string;
  series?: string;
  number?: string;
  volume?: string;
  summary?: string;
  year?: string;
  month?: string;
  day?: string;
  writer?: string;
  penciller?: string;
  inker?: string;
  colorist?: string;
  letterer?: string;
  cover_artist?: string;
  editor?: string;
  publisher?: string;
  imprint?: string;
  format?: string;
  age_rating?: string;
  page_count?: string;
  genre?: string;
  characters?: string;
  teams?: string;
  locations?: string;
  series_group?: string;
  story_arc?: string;
  web?: string;
  language_iso?: string;
  community_rating?: string;
  count?: string;
  scan_information?: string;
}

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".tif"]);

export function getArchiveType(filePath: string): "cbz" | "cbr" | "pdf" | "unknown" {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  if (ext === "cbz" || ext === "zip") return "cbz";
  if (ext === "cbr" || ext === "rar") return "cbr";
  if (ext === "pdf") return "pdf";
  if (ext === "cbt" || ext === "tar") return "cbr"; // treat tar like rar (unar handles both)
  return "unknown";
}

export function isComicFile(filePath: string): boolean {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  return ["cbz", "cbr", "cbt", "pdf", "zip", "rar"].includes(ext);
}

/**
 * Count pages in a PDF using pdfinfo (from poppler-utils).
 * Returns 0 if pdfinfo is unavailable or fails.
 */
export function countPdfPages(pdfPath: string): number {
  try {
    const out = execSync(`pdfinfo "${pdfPath}"`, { stdio: "pipe", encoding: "utf-8", timeout: 10_000 });
    const match = out.match(/^Pages:\s+(\d+)/m);
    return match ? parseInt(match[1], 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Extract ComicInfo.xml from a comic archive using `unar` CLI.
 */
export function extractComicInfoXml(archivePath: string): string | null {
  const workDir = join(tmpdir(), `sequent-ci-${Date.now()}`);
  try {
    mkdirSync(workDir, { recursive: true });

    // Fast path: try extracting ComicInfo.xml specifically
    try {
      execSync(`unar -q -o "${workDir}" "${archivePath}" "ComicInfo.xml"`, {
        stdio: "pipe", timeout: 15_000,
      });
    } catch { /* unar may exit non-zero for RAR5 single-file extraction */ }

    const xmlPath = join(workDir, "ComicInfo.xml");
    if (existsSync(xmlPath)) return readFileSync(xmlPath, "utf-8");

    // Slow path: extract everything
    try {
      execSync(`unar -q -o "${workDir}" "${archivePath}"`, {
        stdio: "pipe", timeout: 60_000,
      });
    } catch { /* unar often exits non-zero even when files extracted */ }

    const findOut = execSync(
      `find "${workDir}" -iname "ComicInfo.xml" -type f 2>/dev/null | head -1`,
      { stdio: "pipe", encoding: "utf-8", timeout: 5_000 },
    );
    const foundPath = findOut.trim();
    if (foundPath && existsSync(foundPath)) return readFileSync(foundPath, "utf-8");

    return null;
  } catch {
    return null;
  } finally {
    try { if (existsSync(workDir)) execSync(`rm -rf "${workDir}"`, { stdio: "pipe" }); } catch { /* ignore */ }
  }
}

/**
 * Parse ComicInfo.xml content into structured metadata.
 */
export async function parseComicInfoXml(xml: string): Promise<ComicMetadata> {
  const { XMLParser } = await import("fast-xml-parser");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    trimValues: true,
    parseTagValue: false,
  });
  const parsed = parser.parse(xml);
  const root = parsed?.ComicInfo;
  if (!root || typeof root !== "object") return {};

  function str(val: unknown): string | undefined {
    if (val === null || val === undefined) return undefined;
    return String(val).trim() || undefined;
  }

  return {
    title: str(root.Title),
    series: str(root.Series),
    number: str(root.Number),
    volume: str(root.Volume),
    summary: str(root.Summary),
    year: str(root.Year),
    month: str(root.Month),
    day: str(root.Day),
    writer: str(root.Writer),
    penciller: str(root.Penciller),
    inker: str(root.Inker),
    colorist: str(root.Colorist),
    letterer: str(root.Letterer),
    cover_artist: str(root.CoverArtist),
    editor: str(root.Editor),
    publisher: str(root.Publisher),
    imprint: str(root.Imprint),
    format: str(root.Format),
    age_rating: str(root.AgeRating),
    page_count: str(root.PageCount),
    genre: str(root.Genre),
    characters: str(root.Characters),
    teams: str(root.Teams),
    locations: str(root.Locations),
    series_group: str(root.SeriesGroup),
    story_arc: str(root.StoryArc),
    web: str(root.Web),
    language_iso: str(root.LanguageISO),
    community_rating: str(root.CommunityRating),
    count: str(root.Count),
    scan_information: str(root.ScanInformation),
  };
}

/**
 * Extract + parse ComicInfo.xml in one call.
 */
export async function getComicInfo(archivePath: string): Promise<ComicMetadata | null> {
  const xml = extractComicInfoXml(archivePath);
  if (!xml) return null;
  return parseComicInfoXml(xml);
}

/**
 * Extract the first image page from a comic archive or PDF.
 * Returns a Buffer with the image data, or null on failure.
 * For PDFs, uses pdftoppm to render page 1.
 */
export function extractFirstPageImage(archivePath: string): Buffer | null {
  const ext = archivePath.slice(archivePath.lastIndexOf(".")).toLowerCase();

  // PDF: render page 1 via pdftoppm
  if (ext === ".pdf") {
    return extractPdfFirstPage(archivePath);
  }

  return extractArchiveFirstImage(archivePath);
}

function extractPdfFirstPage(pdfPath: string): Buffer | null {
  const workDir = join(tmpdir(), `sequent-pdf-cover-${Date.now()}`);
  try {
    mkdirSync(workDir, { recursive: true });
    execSync(`pdftoppm -f 1 -l 1 -r 200 -png "${pdfPath}" "${workDir}/cover"`, {
      stdio: "pipe", timeout: 15_000,
    });
    const generated = join(workDir, "cover-1.png");
    if (existsSync(generated)) return readFileSync(generated);
    return null;
  } catch {
    return null;
  } finally {
    try { execSync(`rm -rf "${workDir}"`, { stdio: "pipe" }); } catch { /* ignore */ }
  }
}

function extractArchiveFirstImage(archivePath: string): Buffer | null {
  const workDir = join(tmpdir(), `sequent-cover-${Date.now()}`);
  try {
    mkdirSync(workDir, { recursive: true });

    // List archive contents as JSON
    const lsarOut = execSync(`lsar -j "${archivePath}"`, {
      stdio: "pipe", encoding: "utf-8", timeout: 10_000,
    });
    const listing = JSON.parse(lsarOut);

    const entries: Array<Record<string, any>> = listing?.lsarContents || [];
    let firstImage: string | null = null;

    for (const entry of entries) {
      const fileName: string | undefined = entry.XADFileName || entry.name || entry.filename;
      if (!fileName || fileName === "ComicInfo.xml") continue;
      const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
      if (IMAGE_EXTS.has(ext)) {
        firstImage = fileName;
        break;
      }
    }
    if (!firstImage) return null;

    // Fast path: extract only the specific file
    try {
      execSync(`unar -q -o "${workDir}" "${archivePath}" "${firstImage}"`, {
        stdio: "pipe", timeout: 15_000,
      });
    } catch { /* unar may fail partially */ }

    let found = findFile(workDir);
    if (found) return readFileSync(found);

    // Slow path: extract everything
    try {
      execSync(`unar -q -o "${workDir}" "${archivePath}"`, {
        stdio: "pipe", timeout: 60_000,
      });
    } catch { /* ignore */ }

    found = findFile(workDir);
    if (!found) return null;
    return readFileSync(found);
  } catch {
    return null;
  } finally {
    try { if (existsSync(workDir)) execSync(`rm -rf "${workDir}"`, { stdio: "pipe" }); } catch { /* ignore */ }
  }
}

function findFile(dir: string): string | null {
  const out = execSync(`find "${dir}" -type f 2>/dev/null | LC_ALL=C sort | head -1`, {
    stdio: "pipe", encoding: "utf-8", timeout: 5_000,
  });
  const path = out.trim();
  return path && existsSync(path) ? path : null;
}

/**
 * List all image entries in a comic archive with their index.
 * Used to get page count and serve individual pages.
 */
export function listArchiveImages(archivePath: string): string[] {
  try {
    const lsarOut = execSync(`lsar -j "${archivePath}"`, {
      stdio: "pipe", encoding: "utf-8", timeout: 10_000,
    });
    const listing = JSON.parse(lsarOut);
    const entries: Array<Record<string, any>> = listing?.lsarContents || [];

    return entries
      .filter((e) => {
        const fn: string = e.XADFileName || e.name || e.filename || "";
        if (fn === "ComicInfo.xml") return false;
        const ext = fn.slice(fn.lastIndexOf(".")).toLowerCase();
        return IMAGE_EXTS.has(ext);
      })
      .map((e) => e.XADFileName || e.name || e.filename || "")
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

/**
 * Extract a specific image from an archive by its filename.
 * Returns the image buffer or null.
 */
export function extractImageFromArchive(archivePath: string, imageName: string, destDir: string): string | null {
  const destPath = join(destDir, imageName.replace(/\//g, "_"));

  if (existsSync(destPath)) return destPath;

  try {
    mkdirSync(destDir, { recursive: true });

    // Try extracting the specific file
    try {
      execSync(`unar -q -o "${destDir}" "${archivePath}" "${imageName}"`, {
        stdio: "pipe", timeout: 15_000,
      });
    } catch { /* may fail for RAR5 */ }

    // Check if the file landed at the expected path
    if (existsSync(destPath)) return destPath;

    // Try with the sanitized name
    const found = findFile(destDir);
    if (found) {
      // Rename it to the sanitized name for consistency
      try { execSync(`mv "${found}" "${destPath}"`, { stdio: "pipe" }); } catch { return found; }
      return destPath;
    }

    // Slow path: extract everything, then find
    try {
      execSync(`unar -q -o "${destDir}" "${archivePath}"`, {
        stdio: "pipe", timeout: 60_000,
      });
    } catch { /* ignore */ }

    const found2 = findFile(destDir);
    if (found2) {
      try { execSync(`mv "${found2}" "${destPath}"`, { stdio: "pipe" }); } catch { return found2; }
      return destPath;
    }

    return null;
  } catch {
    return null;
  }
}
