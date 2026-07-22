/**
 * Auth state composable.
 *
 * Mirrors TransMule's useAuth at the API level:
 * - Token in a cookie (browser sends it automatically, no Authorization header)
 * - User in useState (survives SPA navigation)
 * - $fetch for all API calls
 *
 * Implementation detail: we manage the cookie via document.cookie directly
 * instead of useCookie(), because useCookie's setter is unreliable in SPA
 * mode in this version of Nuxt (3.21.9). The getter also bypasses useCookie
 * and reads document.cookie directly. This is behaviorally identical to what
 * useCookie does when it works correctly.
 */
import { computed, ref } from "vue";

interface User {
  id: number;
  username: string;
  role: "admin" | "user";
}

const COOKIE = "sequent_token";

// Module-level reactive ref — survives all SPA navigations.
// Initialised from document.cookie on first access.
const _token = ref<string | null>(null);

function _readCookie(): string | null {
  if (!import.meta.client) return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return match ? match[1] : null;
}

function _writeCookie(value: string) {
  if (!import.meta.client) return;
  document.cookie = `${COOKIE}=${value}; max-age=604800; path=/; SameSite=Lax`;
}

function _deleteCookie() {
  if (!import.meta.client) return;
  document.cookie = `${COOKIE}=; max-age=0; path=/`;
}

// Lazy init on first import.
if (import.meta.client) {
  _token.value = _readCookie();
}

export function useAuth() {
  // Hydrate from cookie if the ref is still null (first call this session).
  if (import.meta.client && !_token.value) {
    _token.value = _readCookie();
  }

  const user = useState<User | null>("sequent_user", () => null);

  const isLoggedIn = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  function setAuth(t: string, u: User) {
    _token.value = t;
    _writeCookie(t);
    user.value = u;
  }

  function clear() {
    _token.value = null;
    _deleteCookie();
    user.value = null;
  }

  async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const data = await $fetch<{ token: string; user: User }>("/api/auth/login", {
        method: "POST",
        body: { username, password },
      });
      setAuth(data.token, data.user);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.data?.statusMessage || err?.statusMessage || "Login failed",
      };
    }
  }

  async function logout(): Promise<void> {
    try {
      await $fetch("/api/auth/logout", { method: "POST" });
    } catch { /* ignore */ }
    clear();
  }

  async function fetchUser(): Promise<boolean> {
    if (!_token.value) return false;
    try {
      const data = await $fetch<{ user: User }>("/api/auth/me");
      if (data.user) user.value = data.user;
      return true;
    } catch {
      clear();
      return false;
    }
  }

  return {
    isLoggedIn,
    isAdmin,
    user,
    token: _token,
    login,
    logout,
    fetchUser,
    setAuth,
    clear,
  };
}
