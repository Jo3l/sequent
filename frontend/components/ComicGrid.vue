<template>
  <div class="comic-grid-wrapper">
    <div v-if="loading" class="grid-loading">
      <div class="spinner"></div>
      <span>Loading comics...</span>
    </div>

    <div v-else-if="comics.length === 0" class="grid-empty">
      <div class="empty-icon">📚</div>
      <h3>No comics found</h3>
      <p v-if="search">No results for "{{ search }}"</p>
      <p v-else>Add library folders in Admin settings and run a scan.</p>
    </div>

    <div v-else class="comic-grid">
      <ComicCard v-for="comic in comics" :key="comic.id" :comic="comic" />
    </div>

    <div v-if="totalPages > 1" class="grid-pagination">
      <button
        class="page-btn"
        :disabled="page <= 1"
        @click="$emit('pageChange', page - 1)"
      >
        ← Prev
      </button>
      <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
      <button
        class="page-btn"
        :disabled="page >= totalPages"
        @click="$emit('pageChange', page + 1)"
      >
        Next →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  comics: any[];
  loading: boolean;
  page: number;
  totalPages: number;
  search?: string;
}>();

defineEmits<{
  pageChange: [page: number];
}>();
</script>

<style scoped>
.comic-grid-wrapper { display: flex; flex-direction: column; gap: 1.5rem; }

.comic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.25rem;
}

.grid-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 0;
  color: var(--color-text-muted);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.grid-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 4rem 0;
  color: var(--color-text-muted);
}
.empty-icon { font-size: 3rem; }

.grid-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.page-btn {
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all var(--transition);
}
.page-btn:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}
</style>
