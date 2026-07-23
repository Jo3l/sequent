import { getDb, getDataDir, getDataPath } from "../../../utils/db";
import { getRouterParam } from "h3";
import { existsSync, mkdirSync, readdirSync, appendFileSync, writeFileSync, statSync } from "node:fs";
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

// ── Logger ──────────────────────────────────────────────────────────────────

let _logPath: string | null = null;
const LOG_DIR = getDataPath("logs");

function initLogger(comicId: number): string {
  mkdirSync(LOG_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const logPath = join(LOG_DIR, `enhance-${comicId}-${ts}.log`);
  writeFileSync(logPath, "", "utf-8");
  _logPath = logPath;
  return logPath;
}

function log(msg: string): void {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  if (_logPath) {
    try { appendFileSync(_logPath, line, "utf-8"); } catch { /* ignore */ }
  }
  console.log(`[enhance] ${msg}`);
}

// ── Handler ─────────────────────────────────────────────────────────────────

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

// ── Enhancement pipeline ────────────────────────────────────────────────────

async function runEnhancement(comicId: number, physicalPath: string, comic: any) {
  const logPath = initLogger(comicId);
  const workDir = join(tmpdir(), `sequent-enhance-${comicId}-${Date.now()}`);
  const extractedDir = join(workDir, "original");
  const enhancedDir = join(workDir, "enhanced");

  log("=".repeat(60));
  log(`ENHANCEMENT STARTED`);
  log(`  Comic ID:    ${comicId}`);
  log(`  File:        ${physicalPath}`);
  log(`  Log:         ${logPath}`);
  log(`  Temp dir:    ${workDir}`);
  log(`  MODEL_DIR:   ${MODEL_DIR}`);
  log(`  MODEL_NAME:  ${MODEL_NAME}`);
  log(`  UPSCAYL_MODEL_DIR env: ${process.env.UPSCAYL_MODEL_DIR || "(not set)"}`);
  log(`  PATH:        ${process.env.PATH || "(not set)"}`);
  log("=".repeat(60));

  try {
    mkdirSync(extractedDir, { recursive: true });
    const flatDir = join(workDir, "flat");
    mkdirSync(flatDir, { recursive: true });
    mkdirSync(enhancedDir, { recursive: true });

    // ── 1. Extract all images from archive ──────────────────────────────────
    log("── Phase 1: Extracting archive ──");
    updateEnhanceJob(comicId, { phase: "Extracting comic pages..." });

    const extractCmd = `unar -q -o "${extractedDir}" "${physicalPath}"`;
    log(`  Running: ${extractCmd}`);
    const extractStart = Date.now();
    execSync(extractCmd, { stdio: "pipe", timeout: 120_000 });
    log(`  Extraction done in ${Date.now() - extractStart}ms`);

    // Find all extracted images (sorted) and flatten into flatDir
    const findStart = Date.now();
    const allFiles = execSync(
      `find "${extractedDir}" -type f | LC_ALL=C sort`,
      { stdio: "pipe", encoding: "utf-8", timeout: 10_000 },
    ).trim().split("\n").filter(Boolean);
    log(`  find returned ${allFiles.length} total files in ${Date.now() - findStart}ms`);

    const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".tif"]);
    const imageFiles = allFiles.filter(f => {
      const ext = f.slice(f.lastIndexOf(".")).toLowerCase();
      return imageExts.has(ext);
    });
    log(`  Image files found: ${imageFiles.length}`);

    // Flatten: copy each image to flatDir with a numbered name
    log(`  Flattening to: ${flatDir}`);
    const flattenStart = Date.now();
    imageFiles.forEach((src, i) => {
      const ext = src.slice(src.lastIndexOf("."));
      const dst = join(flatDir, `page_${String(i + 1).padStart(4, "0")}${ext}`);
      execSync(`cp "${src}" "${dst}"`, { stdio: "pipe", timeout: 5_000 });
    });
    log(`  Flatten done in ${Date.now() - flattenStart}ms`);

    if (imageFiles.length === 0) {
      log("  ERROR: No images found in comic archive");
      failEnhanceJob(comicId, "No images found in comic archive");
      return;
    }

    const totalPages = imageFiles.length;
    updateEnhanceJob(comicId, {
      phase: "Upscaling images with AI...",
      totalPages,
      currentPage: 1,
    });

    // ── 2. Run upscayl-ncnn one image at a time ────────────────────────────
    log("── Phase 2: AI Upscaling ──");
    updateEnhanceJob(comicId, { phase: "Running AI upscaling..." });

    const sourceFiles = readdirSync(flatDir)
      .filter(f => /\.(jpg|jpeg|png|webp|gif|bmp|tiff|tif)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    log(`  Source files to upscale: ${sourceFiles.length}`);
    for (const sf of sourceFiles) {
      const s = statSync(join(flatDir, sf));
      log(`    ${sf}: ${s.size} bytes`);
    }

    let failedPages = 0;
    const upscaleTotalStart = Date.now();

    for (let i = 0; i < sourceFiles.length; i++) {
      const srcFile = sourceFiles[i];
      const srcPath = join(flatDir, srcFile);
      const outName = `page_${String(i + 1).padStart(4, "0")}.webp`;
      const outPath = join(enhancedDir, outName);

      updateEnhanceJob(comicId, {
        currentPage: i + 1,
        phase: `Upscaling... ${i + 1}/${totalPages}`,
      });

      const pageStart = Date.now();
      log(`  -- Page ${i + 1}/${totalPages}: ${srcFile} -> ${outName} --`);

      try {
        await upscaleOne(srcPath, outPath);
        const elapsed = Date.now() - pageStart;
        const outSize = existsSync(outPath) ? statSync(outPath).size : 0;
        log(`    OK Done in ${elapsed}ms, output: ${outSize} bytes`);
      } catch (e: any) {
        failedPages++;
        const elapsed = Date.now() - pageStart;
        log(`    FAILED after ${elapsed}ms: ${e.message}`);
        updateEnhanceJob(comicId, {
          phase: `Upscaling... ${i + 1}/${totalPages} (${failedPages} failed)`,
        });
      }
    }

    const upscaleTotalElapsed = Date.now() - upscaleTotalStart;
    log(`  Upscale phase done: ${failedPages}/${totalPages} failed, total time: ${upscaleTotalElapsed}ms`);

    if (failedPages === totalPages) {
      log("  ERROR: All pages failed to upscale");
      failEnhanceJob(comicId, "All pages failed to upscale");
      return;
    }

    // ── 3. Verify output ───────────────────────────────────────────────────
    log("── Phase 3: Verifying output ──");
    const enhancedFiles = readdirSync(enhancedDir)
      .filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    log(`  Enhanced files: ${enhancedFiles.length}`);
    for (const ef of enhancedFiles) {
      const s = statSync(join(enhancedDir, ef));
      log(`    ${ef}: ${s.size} bytes`);
    }

    if (enhancedFiles.length === 0) {
      log("  ERROR: No enhanced images produced");
      failEnhanceJob(comicId, "No enhanced images produced");
      return;
    }

    updateEnhanceJob(comicId, {
      currentPage: totalPages,
      phase: "Creating enhanced CBZ...",
    });

    // ── 4. Create enhanced CBZ in /comics folder ────────────────────────────
    log("── Phase 4: Creating CBZ ──");
    const originalName = basename(physicalPath);
    const origExt = extname(originalName);
    const baseName = originalName.slice(0, -origExt.length);
    const enhancedCbzName = `${baseName}-enhanced-ai.cbz`;

    const comicsDir = resolve(getDataDir(), "..", "comics");
    mkdirSync(comicsDir, { recursive: true });

    const outputPath = join(comicsDir, enhancedCbzName);
    log(`  Output: ${outputPath}`);

    const zipCmd = `cd "${enhancedDir}" && zip -q -0 "${outputPath}" *.webp *.png *.jpg *.jpeg 2>/dev/null`;
    log(`  Running: ${zipCmd}`);
    const zipStart = Date.now();
    execSync(zipCmd, { stdio: "pipe", timeout: 60_000 });
    log(`  ZIP done in ${Date.now() - zipStart}ms`);

    if (!existsSync(outputPath)) {
      log("  ERROR: Output CBZ not found after zip");
      failEnhanceJob(comicId, "Failed to create enhanced CBZ file");
      return;
    }

    log(`  CBZ size: ${statSync(outputPath).size} bytes`);

    const downloadPath = `comics/${enhancedCbzName}`;

    // ── 5. Clean up temp dir ───────────────────────────────────────────────
    log("── Phase 5: Cleanup ──");
    try {
      execSync(`rm -rf "${workDir}"`, { stdio: "pipe" });
      log(`  Removed temp dir: ${workDir}`);
    } catch { log("  Warning: could not remove temp dir"); }

    log("=".repeat(60));
    log(`ENHANCEMENT COMPLETED SUCCESSFULLY`);
    log(`  Output: ${outputPath}`);
    log(`  Pages:  ${enhancedFiles.length}`);
    log("=".repeat(60));

    finishEnhanceJob(comicId, downloadPath, enhancedCbzName);
  } catch (e: any) {
    log("=".repeat(60));
    log(`ENHANCEMENT FAILED`);
    log(`  Error: ${e.message}`);
    if (e.stack) log(`  Stack: ${e.stack}`);
    log("=".repeat(60));

    try { execSync(`rm -rf "${workDir}"`, { stdio: "pipe" }); } catch { /* ignore */ }
    failEnhanceJob(comicId, `Enhancement error: ${e.message}`);
  }
}

// ── Upscale single image ────────────────────────────────────────────────────

/** Run upscayl-bin on a single image. Resolves on success, rejects on failure. */
function upscaleOne(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "-i", inputPath,
      "-o", outputPath,
      "-s", "2",
      "-f", "webp",
      "-c", "85",
      "-m", MODEL_DIR,
      "-n", MODEL_NAME,
      "-j", "1:1:1",
    ];

    log(`    Command: upscayl-bin ${args.map(a => a.includes(" ") ? `"${a}"` : a).join(" ")}`);

    // Check if binary exists
    const whichResult = (() => {
      try {
        return execSync("which upscayl-bin", { stdio: "pipe", encoding: "utf-8", timeout: 3000 }).trim();
      } catch { return "(not found in PATH)"; }
    })();
    log(`    Binary:  ${whichResult}`);

    const child = spawn("upscayl-bin", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (d: Buffer) => {
      const text = d.toString();
      stdout += text;
      for (const line of text.split("\n").filter(Boolean)) {
        log(`    [stdout] ${line}`);
      }
    });

    child.stderr?.on("data", (d: Buffer) => {
      const text = d.toString();
      stderr += text;
      for (const line of text.split("\n").filter(Boolean)) {
        log(`    [stderr] ${line}`);
      }
    });

    child.on("close", (code, signal) => {
      log(`    Exit code: ${code}, signal: ${signal || "none"}`);
      if (stdout.trim()) log(`    Full stdout: ${stdout.trim()}`);
      if (stderr.trim()) log(`    Full stderr: ${stderr.trim()}`);

      if (code === 0) {
        // Verify output file exists and is non-zero
        try {
          const s = statSync(outputPath);
          if (s.size === 0) {
            reject(new Error(`upscayl-bin produced empty file (0 bytes)`));
          } else {
            resolve();
          }
        } catch {
          reject(new Error(`upscayl-bin exited 0 but output file missing: ${outputPath}`));
        }
      } else {
        reject(new Error(
          stderr.trim() || `upscayl-bin exited with code ${code}${signal ? `, signal ${signal}` : ""}`
        ));
      }
    });

    child.on("error", (err) => {
      log(`    Process error: ${err.message}`);
      reject(err);
    });
  });
}
