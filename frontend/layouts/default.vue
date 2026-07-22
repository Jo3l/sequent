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
</style>
