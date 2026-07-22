/**
 * Global route middleware — redirects unauthenticated users to /login
 * and handles first-run setup detection.
 *
 * JWT is transported via the sequent_token cookie (no Authorization header).
 * On page reload the user state is empty but the cookie survives — we validate
 * it before redirecting.
 *
 * Pattern aligned with TransMule exactly.
 */
import { useAuth } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware(async (to) => {
  // On auth pages, check setup status and redirect accordingly.
  if (to.path === "/login" || to.path === "/setup") {
    try {
      const status = await $fetch<{ needsSetup: boolean }>("/api/auth/setup");
      if (to.path === "/login" && status.needsSetup) return navigateTo("/setup");
      if (to.path === "/setup" && !status.needsSetup) return navigateTo("/login");
    } catch {
      if (to.path === "/login") return navigateTo("/setup");
    }
    return;
  }

  const auth = useAuth();

  // If we have a token cookie but no user loaded yet, try to validate it.
  if (auth.token.value && !auth.user.value) {
    const valid = await auth.fetchUser();
    if (!valid) return navigateTo("/login", { replace: true });
  }

  // No token at all → check if system needs setup, otherwise redirect to login.
  if (!auth.token.value) {
    try {
      const status = await $fetch<{ needsSetup: boolean }>("/api/auth/setup");
      if (status.needsSetup) return navigateTo("/setup");
    } catch {
      return navigateTo("/setup");
    }
    return navigateTo("/login", { replace: true });
  }

  // All authenticated users can access /admin.
  // Admin-only features are gated in the page itself.
});
