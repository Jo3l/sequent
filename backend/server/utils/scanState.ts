/**
 * In-memory scan job tracker.
 * Single-user app — one scan at a time, state lives in process memory.
 */

export interface ScanStats {
  foldersScanned: number;
  filesFound: number;
  newComics: number;
  updatedComics: number;
  errors: string[];
}

export interface ScanJob {
  jobId: string;
  status: "running" | "completed" | "error";
  startedAt: number;
  phase: string;       // current file being processed
  stats: ScanStats;
  totalFolders: number;
  folderIndex: number; // 0-based index of current folder
  folderLabel: string; // label of current folder
}

let currentJob: ScanJob | null = null;

export function createJob(jobId: string, totalFolders: number): ScanJob {
  currentJob = {
    jobId,
    status: "running",
    startedAt: Date.now(),
    phase: "Starting scan...",
    stats: {
      foldersScanned: 0,
      filesFound: 0,
      newComics: 0,
      updatedComics: 0,
      errors: [],
    },
    totalFolders,
    folderIndex: 0,
    folderLabel: "",
  };
  return currentJob;
}

export function getJob(): ScanJob | null {
  return currentJob;
}

export function updateJob(patch: Partial<ScanJob>): void {
  if (currentJob) Object.assign(currentJob, patch);
}

export function finishJob(): void {
  if (currentJob) currentJob.status = "completed";
}

export function failJob(): void {
  if (currentJob) currentJob.status = "error";
}
