import { getRouterParam } from "h3";
import { getEnhanceJob } from "../../../../utils/enhanceState";

/**
 * Poll enhancement job progress.
 * GET /api/comics/:id/enhance/status
 */
export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);

  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid comic ID" });
  }

  const job = getEnhanceJob(id);

  if (!job) {
    return { active: false };
  }

  return {
    active: job.status === "running",
    status: job.status,
    phase: job.phase,
    currentPage: job.currentPage,
    totalPages: job.totalPages,
    progressPct: job.progressPct,
    error: job.error,
    downloadPath: job.downloadPath,
    downloadName: job.downloadName,
  };
});
