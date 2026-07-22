<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-logo">Sequent</h1>
        <p class="login-subtitle">Comic Reader</p>
      </div>

      <form class="login-form" @submit.prevent="doLogin">
        <div class="field">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Enter username"
            autocomplete="username"
            required
          />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter password"
            autocomplete="current-password"
            required
          />
        </div>
        <div v-if="error" class="login-error">{{ error }}</div>
        <SButton variant="primary" block native-type="submit" :loading="loading">
          Sign In
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
const error = ref("");
const loading = ref(false);

// Redirect if already logged in (cookie-based check, like TransMule).
onMounted(async () => {
  if (auth.token.value) {
    const valid = await auth.fetchUser();
    if (valid) navigateTo("/");
  }
});

async function doLogin() {
  loading.value = true;
  error.value = "";
  try {
    const result = await auth.login(username.value, password.value);
    if (result.success) {
      navigateTo("/");
    } else {
      error.value = result.error || "Login failed";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: 2.5rem 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.02em;
}

.login-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.login-form {
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

.login-error {
  font-size: 0.8125rem;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
}
</style>
