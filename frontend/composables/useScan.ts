/**
 * Scan state composable — shared across the app so the top bar can show progress.
 */

export interface ScanJob {
  active: boolean;
  jobId?: string;
  status?: "running" | "completed" | "error";
  startedAt?: number;
  phase?: string;
  stats?: {
    foldersScanned: number;
    filesFound: number;
    newComics: number;
    updatedComics: number;
    errors: string[];
  };
  totalFolders?: number;
  folderIndex?: number;
  folderLabel?: string;
}

const scanState = ref<ScanJob>({ active: false });
let pollTimer: ReturnType<typeof setInterval> | null = null;

export function useScan() {
  const { apiFetch } = useApi();

  async function triggerScan(): Promise<void> {
    if (scanState.value.active) return;

    // Fire and forget — scan runs in background
    try {
      await apiFetch("/api/scan", { method: "POST" });
      startPolling();
    } catch {
      // ignore
    }
  }

  function startPolling() {
    if (pollTimer) return;
    scanState.value = { active: true, phase: "Starting scan..." };

    pollTimer = setInterval(async () => {
      try {
        const data = await apiFetch<ScanJob>("/api/scan/status");
        if (!data.active) {
          // Scan completed — final update
          scanState.value = data;
          stopPolling();
          return;
        }
        scanState.value = data;
      } catch {
        // ignore polling errors
      }
    }, 1000);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    // Keep completed state visible for a few seconds then clear
    setTimeout(() => {
      if (scanState.value.status === "completed" || scanState.value.status === "error") {
        scanState.value = { active: false };
      }
    }, 5000);
  }

  // Check if there's a running scan on mount (page refresh)
  async function checkActive() {
    try {
      const data = await apiFetch<ScanJob>("/api/scan/status");
      if (data.active) {
        scanState.value = data;
        startPolling();
      }
    } catch {
      // ignore
    }
  }

  return {
    scanState,
    triggerScan,
    checkActive,
  };
}
