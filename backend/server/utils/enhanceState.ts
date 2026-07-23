/**
 * In-memory enhancement job tracker.
 * Supports multiple concurrent jobs (one per comic).
 */

export interface EnhanceJob {
  jobId: string;
  comicId: number;
  status: "running" | "completed" | "error";
  startedAt: number;
  phase: string;
  currentPage: number;
  totalPages: number;
  progressPct: number;
  error?: string;
  /** Download path for the enhanced CBZ file (relative to data dir) */
  downloadPath?: string;
  /** Display name for the enhanced file */
  downloadName?: string;
}

const jobs = new Map<number, EnhanceJob>();

export function createEnhanceJob(comicId: number): EnhanceJob {
  const job: EnhanceJob = {
    jobId: `enhance-${comicId}-${Date.now()}`,
    comicId,
    status: "running",
    startedAt: Date.now(),
    phase: "Starting...",
    currentPage: 0,
    totalPages: 0,
    progressPct: 0,
  };
  jobs.set(comicId, job);
  return job;
}

export function getEnhanceJob(comicId: number): EnhanceJob | null {
  return jobs.get(comicId) ?? null;
}

export function updateEnhanceJob(comicId: number, patch: Partial<EnhanceJob>): void {
  const job = jobs.get(comicId);
  if (job) {
    Object.assign(job, patch);
    if (job.totalPages > 0) {
      job.progressPct = Math.round((job.currentPage / job.totalPages) * 100);
    }
  }
}

export function finishEnhanceJob(comicId: number, downloadPath: string, downloadName: string): void {
  const job = jobs.get(comicId);
  if (job) {
    job.status = "completed";
    job.downloadPath = downloadPath;
    job.downloadName = downloadName;
    job.progressPct = 100;
  }
}

export function failEnhanceJob(comicId: number, error: string): void {
  const job = jobs.get(comicId);
  if (job) {
    job.status = "error";
    job.error = error;
  }
}

/** Check if a job is still running for a given comic */
export function isEnhancing(comicId: number): boolean {
  const job = jobs.get(comicId);
  return job?.status === "running";
}
