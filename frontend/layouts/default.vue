<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-left">
        <NuxtLink to="/" class="logo">Sequent</NuxtLink>
      </div>
      <nav class="header-nav" v-if="auth.isLoggedIn">
        <NuxtLink to="/" class="nav-link">Library</NuxtLink>
        <NuxtLink to="/admin" class="nav-link">Settings</NuxtLink>
      </nav>
      <div class="header-right">
        <!-- Scan progress -->
        <div v-if="scanState.active" class="scan-progress">
          <span class="scan-spinner"></span>
          <span class="scan-phase">{{ scanState.phase || "Scanning..." }}</span>
          <span v-if="scanState.stats" class="scan-stats">
            {{ scanState.stats.filesFound }} files · {{ scanState.stats.newComics }} new
            <template v-if="scanState.stats.errors.length">
              · <span class="scan-errors">{{ scanState.stats.errors.length }} errors</span>
            </template>
          </span>
        </div>
        <!-- Pending completed state (shows for 5s after done) -->
        <div v-else-if="scanState.status === 'completed'" class="scan-done">
          <span>✓ {{ scanState.stats?.newComics || 0 }} new, {{ scanState.stats?.updatedComics || 0 }} updated</span>
        </div>
        <div v-else-if="scanState.status === 'error'" class="scan-done scan-error-msg">
          <span>⚠ Scan failed</span>
        </div>

        <template v-if="auth.isLoggedIn">
          <span class="user-label">{{ auth.user?.username }}</span>
          <button class="btn-header btn-logout" @click="handleLogout">Logout</button>
        </template>
      </div>
    </header>
    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";

const auth = useAuth();
const { scanState, checkActive } = useScan();

// Check for running scan on mount (e.g., page refresh during scan)
onMounted(() => { checkActive(); });

async function handleLogout() {
  await auth.logout();
  navigateTo("/login");
}
</script>

<style scoped>
/* ── Layout ── */
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 56px;
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.02em;
}

.header-nav {
  display: flex;
  gap: 0.25rem;
}

.nav-link {
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition);
}
.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-text);
  background: var(--color-bg-hover);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-label {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.btn-header {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
}
.btn-header:hover {
  color: var(--color-text);
  background: var(--color-bg-hover);
}

.btn-logout:hover {
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ── Scan progress ── */
.scan-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  padding: 0.25rem 0.75rem;
  background: var(--color-bg-hover);
  border-radius: var(--radius-sm);
}

.scan-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: scan-spin 0.6s linear infinite;
  flex-shrink: 0;
}

@keyframes scan-spin {
  to { transform: rotate(360deg); }
}

.scan-phase {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scan-stats {
  color: var(--color-text-dim);
  white-space: nowrap;
}

.scan-errors {
  color: var(--color-danger);
}

.scan-done {
  font-size: 0.75rem;
  color: var(--color-success, #22c55e);
  padding: 0.25rem 0.75rem;
  background: var(--color-bg-hover);
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.scan-error-msg {
  color: var(--color-danger);
}
</style>
