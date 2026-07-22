<template>
  <div class="comic-page">
    <div v-if="comic" class="comic-detail">
      <div class="detail-header">
        <NuxtLink to="/" class="back-link">← Back to Library</NuxtLink>
      </div>

      <div class="detail-body">
        <!-- Cover -->
        <div class="detail-cover">
          <img
            v-if="coverUrl"
            :src="coverUrl"
            :alt="comic.title"
            class="detail-cover-img"
          />
          <div v-else class="detail-cover-placeholder">
            <span>{{ (comic.title || comic.file_name)?.charAt(0)?.toUpperCase() || '?' }}</span>
          </div>
        </div>

        <!-- Info -->
        <div class="detail-info">
          <h1 class="detail-title">{{ displayTitle }}</h1>

          <div class="detail-meta">
            <span v-if="comic.issue_number" class="meta-tag">#{{ comic.issue_number }}</span>
            <span v-if="comic.volume" class="meta-tag">Vol. {{ comic.volume }}</span>
            <span v-if="comic.year" class="meta-tag">{{ comic.year }}</span>
          </div>

          <div v-if="comic.publisher" class="detail-row">
            <span class="detail-label">Publisher</span>
            <span>{{ comic.publisher }}</span>
          </div>

          <div v-if="comic.page_count" class="detail-row">
            <span class="detail-label">Pages</span>
            <span>{{ comic.page_count }}</span>
          </div>

          <div v-if="seriesAndIssue" class="detail-row">
            <span class="detail-label">Series</span>
            <span>{{ seriesAndIssue }}</span>
          </div>

          <div class="detail-actions">
            <SButton variant="primary" size="lg" @click="startReading">
              📖 Read Now
            </SButton>
          </div>

          <!-- Summary -->
          <div v-if="summary" class="detail-section">
            <h3>Summary</h3>
            <p>{{ summary }}</p>
          </div>

          <!-- Credits -->
          <div v-if="writer" class="detail-section">
            <h3>Credits</h3>
            <div class="detail-row"><span class="detail-label">Writer</span><span>{{ writer }}</span></div>
            <div v-if="penciller" class="detail-row"><span class="detail-label">Penciller</span><span>{{ penciller }}</span></div>
          </div>

          <!-- Characters -->
          <div v-if="characters" class="detail-section">
            <h3>Characters</h3>
            <p>{{ characters }}</p>
          </div>

          <!-- Story Arc -->
          <div v-if="storyArc" class="detail-section">
            <h3>Story Arc</h3>
            <p>{{ storyArc }}</p>
          </div>

          <!-- Comic Vine link -->
          <div v-if="cvUrl" class="detail-section">
            <a :href="cvUrl" target="_blank" class="cv-link">View on Comic Vine →</a>
          </div>

          <!-- File info -->
          <div v-if="comic.file_name" class="detail-file">
            <span class="detail-label">File</span>
            <code>{{ comic.file_name }}</code>
          </div>

          <!-- Manual match button (when no CV data) -->
          <div v-if="!meta.cv_id" class="detail-match-area">
            <div class="match-warning">⚠️ No Comic Vine metadata found</div>
            <SButton variant="primary" @click="openMatchModal" :loading="matchLoading">
              🔍 Match with Comic Vine
            </SButton>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="comic-loading">
      <div class="spinner"></div>
      <span>Loading...</span>
    </div>

    <div v-else class="comic-error">
      <p>Comic not found</p>
      <NuxtLink to="/">Back to Library</NuxtLink>
    </div>

    <!-- Reader overlay -->
    <ComicReader
      :visible="readerOpen"
      :comic-id="comicId"
      :comic-title="comic?.title || comic?.file_name || ''"
      :page-count="comic?.page_count || 0"
      @close="onReaderClose"
    />

    <!-- Manual match modal -->
    <Teleport to="body">
      <div v-if="showMatchModal" class="modal-overlay" @click.self="showMatchModal = false">
        <div class="modal match-modal">
          <h3>Match Comic</h3>
          <p class="match-hint">Select the correct Comic Vine entry for <strong>{{ comic?.file_name }}</strong></p>

          <div v-if="suggestions.length === 0 && matchLoading" class="match-empty">Searching...</div>
          <div v-else-if="suggestions.length === 0" class="match-empty">No suggestions found.</div>

          <div v-else class="match-list">
            <button
              v-for="s in suggestions"
              :key="s.issue_id"
              class="match-item"
              :class="{ selected: selectedCvId === s.issue_id }"
              @click="selectedCvId = s.issue_id"
            >
              <div class="match-item-main">
                <strong>{{ s.volume_name }}</strong>
                <span v-if="s.name && s.name !== s.volume_name" class="match-name">— {{ s.name }}</span>
                <span class="match-issue">#{{ s.issue_number }}</span>
              </div>
              <div class="match-item-meta">
                <span v-if="s.publisher_name">{{ s.publisher_name }}</span>
                <span v-if="s.cover_date">{{ s.cover_date }}</span>
                <span class="match-type">{{ s.match_type }}</span>
              </div>
              <div v-if="s.description" class="match-item-desc">{{ truncate(s.description, 150) }}</div>
            </button>
          </div>

          <div class="modal-actions">
            <SButton variant="secondary" @click="showMatchModal = false">Cancel</SButton>
            <SButton variant="primary" @click="applyMatch" :loading="matchSaving" :disabled="!selectedCvId">
              Apply Match
            </SButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { apiFetch } = useApi();
const comic = ref<any>(null);
const loading = ref(true);
const readerOpen = ref(false);

const comicId = computed(() => parseInt(String(route.params.id), 10));

const coverUrl = computed(() => comic.value?.cover_path ? `/api/covers/${comic.value.id}` : "");

const displayTitle = computed(() => comic.value?.title || comic.value?.file_name || "Untitled");

// Extract metadata from metadata_json
const meta = computed(() => comic.value?.metadata || {});
const summary = computed(() => meta.value.summary || meta.value.cv_description || "");
const writer = computed(() => meta.value.writer || parseCredits(meta.value.cv_person_credits, "writer"));
const penciller = computed(() => parseCredits(meta.value.cv_person_credits, "penciller"));
const characters = computed(() => meta.value.characters || parseCredits(meta.value.cv_character_credits));
const storyArc = computed(() => parseCredits(meta.value.cv_story_arc_credits));
const cvUrl = computed(() => meta.value.cv_url || (meta.value.cv_id ? `https://comicvine.gamespot.com/4000-${meta.value.cv_id}/` : ""));
const seriesAndIssue = computed(() => {
  const parts: string[] = [];
  if (meta.value.cv_volume_name) parts.push(meta.value.cv_volume_name);
  if (comic.value?.issue_number) parts.push(`#${comic.value.issue_number}`);
  return parts.join(" ") || "";
});

function parseCredits(json: string | undefined, role?: string): string {
  if (!json) return "";
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return "";
    if (role) {
      return arr.filter((c: any) => c.role?.toLowerCase() === role.toLowerCase())
        .map((c: any) => c.name).join(", ");
    }
    return arr.map((c: any) => c.name || c).join(", ");
  } catch { return ""; }
}

async function fetchComic() {
  loading.value = true;
  try {
    const data = await apiFetch<any>(`/api/comics/${comicId.value}`);
    comic.value = data.comic;
  } catch { /* ignore */ }
  loading.value = false;
}

function startReading() {
  readerOpen.value = true;
  // Set hash to page 1 if none
  if (!window.location.hash) {
    history.replaceState(null, "", "#1");
  }
}

function onReaderClose() {
  readerOpen.value = false;
  // Remove hash from URL
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

onMounted(async () => {
  await fetchComic();
  // Auto-open reader if URL has a page hash (#15, #p15)
  const hash = window.location.hash;
  const pageFromHash = parseInt((hash || "").replace(/^#p?/, ""), 10);
  if (pageFromHash >= 1) {
    readerOpen.value = true;
  }
});

// ── Manual match ────────────────────────────────────────────────────────────
const showMatchModal = ref(false);
const suggestions = ref<any[]>([]);
const selectedCvId = ref<number | null>(null);
const matchLoading = ref(false);
const matchSaving = ref(false);

async function openMatchModal() {
  showMatchModal.value = true;
  suggestions.value = [];
  selectedCvId.value = null;
  matchLoading.value = true;
  try {
    const data = await apiFetch<{ candidates: any[] }>(`/api/comics/${comicId.value}/suggestions`);
    suggestions.value = data.candidates || [];
  } catch { /* ignore */ }
  matchLoading.value = false;
}

async function applyMatch() {
  if (!selectedCvId.value) return;
  matchSaving.value = true;
  try {
    const data = await apiFetch<any>(`/api/comics/${comicId.value}/match`, {
      method: "POST",
      body: { cv_issue_id: selectedCvId.value },
    });
    showMatchModal.value = false;
    // Navigate to the new slug-based URL
    if (data.comic?.slug) {
      await navigateTo(`/comic/${data.comic.id}-${data.comic.slug}`, { replace: true });
    }
    await fetchComic();
  } catch { /* ignore */ }
  matchSaving.value = false;
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "..." : s;
}
</script>

<style scoped>
.comic-page { flex: 1; padding: 1.5rem; }
.detail-header { margin-bottom: 1.5rem; }
.back-link { font-size: 0.875rem; color: var(--color-text-muted); transition: color 0.15s; }
.back-link:hover { color: var(--color-text); }
.detail-body { display: flex; gap: 2rem; }
.detail-cover { flex-shrink: 0; width: 300px; }
.detail-cover-img { width: 100%; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); }
.detail-cover-placeholder {
  aspect-ratio: 2/3; background: var(--color-bg-card); border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 4rem; color: var(--color-primary);
}
.detail-info { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.detail-title { font-size: 1.75rem; font-weight: 700; line-height: 1.2; }
.detail-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.25rem; }
.meta-tag {
  padding: 0.2rem 0.5rem; background: var(--color-primary-bg);
  color: var(--color-primary); border-radius: var(--radius-sm);
  font-size: 0.8125rem; font-weight: 500;
}
.detail-row { display: flex; gap: 0.5rem; font-size: 0.875rem; color: var(--color-text-muted); }
.detail-label { min-width: 80px; font-weight: 500; color: var(--color-text-dim); }
.detail-actions { margin: 0.5rem 0; }
.detail-match-area {
  margin: 1rem 0; padding: 1rem; border-radius: var(--radius-md);
  border: 1px dashed var(--color-warning);
  background: rgba(245, 158, 11, 0.08);
  display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start;
}
.match-warning { font-size: 0.8125rem; color: var(--color-warning); font-weight: 500; }
.detail-section { margin-top: 0.5rem; }
.detail-section h3 { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.35rem; }
.detail-section p { font-size: 0.8125rem; color: var(--color-text-muted); line-height: 1.5; }
.cv-link { font-size: 0.8125rem; }
.detail-file { margin-top: auto; padding-top: 1rem; }
.detail-file code { font-size: 0.75rem; color: var(--color-text-dim); background: var(--color-bg-card); padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); }
.comic-loading, .comic-error {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1rem; padding: 4rem 0; color: var(--color-text-muted);
}
.spinner {
  width: 32px; height: 32px; border: 3px solid var(--color-border);
  border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 640px) { .detail-body { flex-direction: column; } .detail-cover { width: 200px; } }
</style>

<style>
/* Modal + match styles — non-scoped because of Teleport to body */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 1.5rem; width: 100%; display: flex; flex-direction: column; gap: 1rem; }
.modal h3 { font-size: 1.1rem; font-weight: 600; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; }
.match-modal { max-width: 520px; max-height: 80vh; overflow-y: auto; }
.match-hint { font-size: 0.8125rem; color: var(--color-text-muted); margin-bottom: 0.5rem; }
.match-empty { font-size: 0.875rem; color: var(--color-text-dim); padding: 2rem 0; text-align: center; }
.match-list { display: flex; flex-direction: column; gap: 0.5rem; }
.match-item {
  display: flex; flex-direction: column; gap: 0.25rem;
  padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border);
  background: var(--color-bg-card); text-align: left; transition: all var(--transition); cursor: pointer;
}
.match-item:hover { border-color: var(--color-primary); }
.match-item.selected { border-color: var(--color-primary); background: var(--color-primary-bg); }
.match-item-main { font-size: 0.875rem; display: flex; gap: 0.35rem; flex-wrap: wrap; }
.match-name { color: var(--color-text-muted); }
.match-issue { color: var(--color-primary); font-weight: 500; }
.match-item-meta { font-size: 0.75rem; color: var(--color-text-dim); display: flex; gap: 0.75rem; }
.match-type { color: var(--color-primary); text-transform: capitalize; }
.match-item-desc { font-size: 0.75rem; color: var(--color-text-muted); line-height: 1.4; }
</style>
