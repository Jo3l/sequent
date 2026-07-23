<template>
  <div class="library-page">
    <div class="library-header">
      <h2 class="library-title">Library</h2>
      <div class="library-toolbar">
        <input
          v-model="search"
          class="search-input"
          type="text"
          placeholder="Search comics..."
          @input="debouncedSearch"
        />
        <SButton
          v-if="auth.isAdmin"
          variant="default"
          size="sm"
          @click="triggerScan"
          :loading="scanState.active"
        >
          🔄 Scan Library
        </SButton>
      </div>
    </div>

    <ComicGrid
      :comics="comics"
      :loading="loading"
      :page="page"
      :totalPages="totalPages"
      :search="search"
      @page-change="setPage"
    />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";

const { apiFetch } = useApi();
const auth = useAuth();
const { scanState, triggerScan } = useScan();
const comics = ref<any[]>([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(0);
const search = ref("");

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

async function fetchComics() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      limit: "24",
    });
    if (search.value) params.set("search", search.value);

    const data = await apiFetch<any>(`/api/comics?${params}`);
    comics.value = data.comics;
    totalPages.value = data.pagination.totalPages;
  } catch { /* ignore */ }
  loading.value = false;
}

function setPage(p: number) {
  page.value = p;
  fetchComics();
}

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchComics();
  }, 300);
}

// Refresh comic list when scan completes
watch(() => scanState.value.status, (status) => {
  if (status === "completed") fetchComics();
});

onMounted(async () => {
  await fetchComics();
});
</script>

<style scoped>
.library-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.library-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.library-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.library-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-input {
  width: 260px;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text);
  font-size: 0.875rem;
}
.search-input::placeholder { color: var(--color-text-dim); }
</style>
