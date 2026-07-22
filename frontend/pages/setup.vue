<template>
  <div class="setup-page">
    <div class="setup-card">
      <div class="setup-header">
        <h1 class="setup-logo">Sequent</h1>
        <p class="setup-subtitle">First Time Setup</p>
      </div>

      <div v-if="alreadyDone" class="setup-done">
        <p>✅ Setup has already been completed.</p>
        <NuxtLink to="/login" class="setup-link">Go to Login →</NuxtLink>
      </div>

      <form v-else class="setup-form" @submit.prevent="handleSetup">
        <div class="setup-banner">
          <span>🔧</span> Create your admin account to get started
        </div>
        <div class="field">
          <label for="setup-username">Username</label>
          <input
            id="setup-username"
            v-model="username"
            type="text"
            placeholder="Choose a username"
            autocomplete="username"
            required
          />
        </div>
        <div class="field">
          <label for="setup-password">Password</label>
          <input
            id="setup-password"
            v-model="password"
            type="password"
            placeholder="Choose a strong password"
            autocomplete="new-password"
            required
          />
        </div>
        <div class="field">
          <label for="setup-confirm">Confirm Password</label>
          <input
            id="setup-confirm"
            v-model="confirm"
            type="password"
            placeholder="Repeat your password"
            autocomplete="new-password"
            required
          />
        </div>
        <div v-if="error" class="setup-error">{{ error }}</div>
        <SButton variant="primary" block native-type="submit" :loading="loading">
          Create Admin Account
        </SButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";

definePageMeta({
  layout: "auth",
});

const auth = useAuth();
const username = ref("");
const password = ref("");
const confirm = ref("");
const error = ref("");
const loading = ref(false);
const alreadyDone = ref(false);

onMounted(async () => {
  try {
    const data = await $fetch<{ needsSetup: boolean }>("/api/auth/setup");
    if (!data.needsSetup) {
      alreadyDone.value = true;
    }
  } catch { /* ignore */ }
});

async function handleSetup() {
  error.value = "";

  if (password.value !== confirm.value) {
    error.value = "Passwords do not match";
    return;
  }
  if (password.value.length < 6) {
    error.value = "Password must be at least 6 characters";
    return;
  }

  loading.value = true;
  try {
    const data = await $fetch<{ token: string; user: any }>("/api/auth/setup", {
      method: "POST",
      body: { username: username.value, password: password.value },
    });
    auth.setAuth(data.token, data.user);
    navigateTo("/");
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.statusMessage || "Setup failed";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.setup-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 1rem;
}

.setup-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: 2.5rem 2rem;
}

.setup-header {
  text-align: center;
  margin-bottom: 2rem;
}

.setup-logo {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.02em;
}

.setup-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.field input {
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text);
  font-size: 0.9375rem;
}

.setup-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--color-primary-bg);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  color: var(--color-primary);
}

.setup-error {
  font-size: 0.8125rem;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
}

.setup-done {
  text-align: center;
  padding: 2rem 0;
}
.setup-done p {
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}
.setup-link {
  color: var(--color-primary);
  font-weight: 500;
}
</style>
