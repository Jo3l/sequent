import { getDb, getDataDir, getDataPath } from "../../../utils/db";
import { getRouterParam } from "h3";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, join, basename, extname } from "node:path";
import { execSync, spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { getArchiveType } from "../../../utils/comicArchive";
import {
  createEnhanceJob,
  getEnhanceJob,
  updateEnhanceJob,
  finishEnhanceJob,
  failEnhanceJob,
  isEnhancing,
} from "../../../utils/enhanceState";

const MODEL_DIR = process.env.UPSCAYL_MODEL_DIR || getDataPath("models");
const MODEL_NAME = "realesr-animevideov3-x2";

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);

  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid comic ID" });
  }

  const db = getDb();
  const comic = db.prepare("SELECT * FROM comics WHERE id = ?").get(id) as any;
  if (!comic) {
    throw createError({ statusCode: 404, statusMessage: "Comic not found" });
  }

  // Check not already enhancing
  if (isEnhancing(id)) {
    const existing = getEnhanceJob(id);
    throw createError({
      statusCode: 409,
      statusMessage: existing?.status === "running"
        ? "Enhancement already in progress"
        : "Already enhanced or previously attempted",
    });
  }

  // Resolve physical path
  let physicalPath: string = comic.file_path;
  if (!physicalPath.startsWith("/")) {
    physicalPath = resolve(getDataDir(), "..", physicalPath);
  }

  if (!existsSync(physicalPath)) {
    throw createError({ statusCode: 404, statusMessage: "Comic file not found on disk" });
  }

  const archiveType = getArchiveType(physicalPath);
  if (archiveType === "pdf") {
    throw createError({ statusCode: 400, statusMessage: "PDF enhancement is not yet supported" });
  }

  // Create job and return immediately
  const job = createEnhanceJob(id);

  // Run enhancement in background
  setTimeout(async () => {
    await new Promise(r => setTimeout(r, 50));
    await runEnhancement(id, physicalPath, comic);
  });

  return { success: true, jobId: job.jobId };
});

async function runEnhancement(comicId: number, physicalPath: string, comic: any) {
  const workDir = join(tmpdir(), `sequent-enhance-${comicId}-${Date.now()}`);
  const extractedDir = join(workDir, "original");
  const enhancedDir = join(workDir, "enhanced");

  try {
    mkdirSync(extractedDir, { recursive: true });
    const flatDir = join(workDir, "flat");
    mkdirSync(flatDir, { recursive: true });
    mkdirSync(enhancedDir, { recursive: true });

    // ── 1. Extract all images from archive ──────────────────────────────────
    updateEnhanceJob(comicId, { phase: "Extracting comic pages..." });
    execSync(`unar -q -o "${extractedDir}" "${physicalPath}"`, {
      stdio: "pipe",
      timeout: 120_000,
    });

    // Find all extracted images (sorted) and flatten into flatDir
    // unar preserves folder structure; upscayl-bin doesn't recurse into subdirs
    const allFiles = execSync(
      `find "${extractedDir}" -type f | LC_ALL=C sort`,
      { stdio: "pipe", encoding: "utf-8", timeout: 10_000 },
    ).trim().split("\n").filter(Boolean);

    const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".tif"]);
    const imageFiles = allFiles.filter(f => {
      const ext = f.slice(f.lastIndexOf(".")).toLowerCase();
      return imageExts.has(ext);
    });

    // Flatten: copy each image to flatDir with a numbered name
    imageFiles.forEach((src, i) => {
      const ext = src.slice(src.lastIndexOf("."));
      const dst = join(flatDir, `page_${String(i + 1).padStart(4, "0")}${ext}`);
      execSync(`cp "${src}" "${dst}"`, { stdio: "pipe", timeout: 5_000 });
    });

    if (imageFiles.length === 0) {
      failEnhanceJob(comicId, "No images found in comic archive");
      return;
    }

    const totalPages = imageFiles.length;
    updateEnhanceJob(comicId, {
      phase: "Upscaling images with AI...",
      totalPages,
      currentPage: 1,
    });

    // ── 2. Run upscayl-ncnn on the flattened directory ──────────────────────
    updateEnhanceJob(comicId, { phase: "Running AI upscaling..." });

    // Run upscayl-bin asynchronously so the event loop stays responsive for polling
    const upscaylResult = await new Promise<{ success: boolean; error?: string }>((resolve) => {
      const child = spawn("upscayl-bin", [
        "-i", flatDir,
        "-o", enhancedDir,
        "-s", "2",
        "-f", "webp",
        "-c", "85",
        "-m", MODEL_DIR,
        "-n", MODEL_NAME,
        "-j", "1:1:1",
        "-v",
      ], { stdio: "pipe", timeout: 600_000 });

      const progressInterval = setInterval(() => {
        const job = getEnhanceJob(comicId);
        if (job && job.currentPage < totalPages) {
          // Count actual output files instead of time-based guessing
          try {
            const done = readdirSync(enhancedDir).filter(f => f.endsWith(".webp")).length;
            if (done > job.currentPage) {
              updateEnhanceJob(comicId, {
                currentPage: done,
                phase: `Upscaling... ${done}/${totalPages}`,
              });
            }
          } catch { /* directory may not exist yet */ }
        }
      }, 5000);

      let stderr = "";
      child.stderr?.on("data", (d: Buffer) => { stderr += d.toString(); });

      child.on("close", (code) => {
        clearInterval(progressInterval);
        resolve({ success: code === 0, error: stderr || undefined });
      });

      child.on("error", (err) => {
        clearInterval(progressInterval);
        resolve({ success: false, error: err.message });
      });
    });

    if (!upscaylResult.success) {
      // upscayl-bin may exit non-zero but still produce output
      const enhancedFiles = readdirSync(enhancedDir).filter(f => f.endsWith(".webp"));
      if (enhancedFiles.length === 0) {
        failEnhanceJob(comicId, `Upscaling failed: ${upscaylResult.error || "unknown error"}`);
        return;
      }
    }

    // ── 3. Verify output ───────────────────────────────────────────────────
    const enhancedFiles = readdirSync(enhancedDir)
      .filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (enhancedFiles.length === 0) {
      failEnhanceJob(comicId, "No enhanced images produced");
      return;
    }

    updateEnhanceJob(comicId, {
      currentPage: totalPages,
      phase: "Creating enhanced CBZ...",
    });

    // ── 4. Create enhanced CBZ in /comics folder ────────────────────────────
    const originalName = basename(physicalPath);
    const origExt = extname(originalName);
    const baseName = originalName.slice(0, -origExt.length);
    const enhancedCbzName = `${baseName}-enhanced-ai.cbz`;

    // Save to the /comics folder so the scanner picks it up naturally
    const comicsDir = resolve(getDataDir(), "..", "comics");
    mkdirSync(comicsDir, { recursive: true });

    const outputPath = join(comicsDir, enhancedCbzName);

    // Use zip to create CBZ (CBZ is just a zip file)
    const zipCmd = `cd "${enhancedDir}" && zip -q -0 "${outputPath}" *.webp *.png *.jpg *.jpeg 2>/dev/null`;
    execSync(zipCmd, { stdio: "pipe", timeout: 60_000 });

    if (!existsSync(outputPath)) {
      failEnhanceJob(comicId, "Failed to create enhanced CBZ file");
      return;
    }

    // ── 5. Track the enhanced file (no DB entry — scanner picks it up) ──────
    const downloadPath = `comics/${enhancedCbzName}`;

    // ── 6. Clean up temp dir ───────────────────────────────────────────────
    try { execSync(`rm -rf "${workDir}"`, { stdio: "pipe" }); } catch { /* ignore */ }

    finishEnhanceJob(comicId, downloadPath, enhancedCbzName);
  } catch (e: any) {
    try { execSync(`rm -rf "${workDir}"`, { stdio: "pipe" }); } catch { /* ignore */ }
    failEnhanceJob(comicId, `Enhancement error: ${e.message}`);
  }
}
