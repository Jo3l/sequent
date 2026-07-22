<template>
  <NuxtLink :to="linkUrl" class="comic-card">
    <div class="comic-cover">
      <img
        v-if="coverUrl"
        :src="coverUrl"
        :alt="comic.title"
        loading="lazy"
        class="cover-img"
      />
      <div v-else class="cover-placeholder">
        <span class="placeholder-text">{{ comic.title.charAt(0).toUpperCase() }}</span>
      </div>
    </div>
    <div class="comic-info">
      <h3 class="comic-title">{{ comic.title || comic.file_name }}</h3>
      <div v-if="comic.issue_number" class="comic-issue">#{{ comic.issue_number }}</div>
      <div v-if="comic.publisher" class="comic-publisher">{{ comic.publisher }}</div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  comic: {
    id: number;
    title: string;
    file_name: string;
    cover_path: string;
    issue_number: string;
    publisher: string;
    slug?: string;
  };
}>();

const coverUrl = computed(() => {
  if (props.comic.cover_path) {
    return `/api/covers/${props.comic.id}`;
  }
  return "";
});

const linkUrl = computed(() => {
  const s = props.comic.slug || "";
  return s ? `/comic/${props.comic.id}-${s}` : `/comic/${props.comic.id}`;
});
</script>

<style scoped>
.comic-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition);
  border: 1px solid transparent;
  text-decoration: none;
  color: inherit;
}
.comic-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.comic-cover {
  aspect-ratio: 2/3;
  background: var(--color-bg-elevated);
  overflow: hidden;
  position: relative;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.comic-card:hover .cover-img {
  transform: scale(1.05);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-bg);
}

.placeholder-text {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-primary);
}

.comic-info {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.comic-title {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comic-issue {
  font-size: 0.75rem;
  color: var(--color-primary);
  font-weight: 500;
}

.comic-publisher {
  font-size: 0.6875rem;
  color: var(--color-text-muted);
}
</style>
