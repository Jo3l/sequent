import { getJob } from "../../utils/scanState";

/**
 * Poll scan job progress.
 * GET /api/scan/status
 *
 * Returns the current scan job state or null if no scan is active.
 */
export default defineEventHandler(async (_event) => {
  const job = getJob();

  if (!job) {
    return { active: false };
  }

  return {
    active: job.status === "running",
    ...job,
  };
});
