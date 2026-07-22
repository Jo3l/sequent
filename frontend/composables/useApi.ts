/**
 * API client composable.
 *
 * Wraps $fetch (ofetch) for all backend calls. No Authorization header is
 * added — authentication is handled by the sequent_token cookie, which the
 * browser sends automatically on every same-origin request.
 *
 * Pattern aligned with TransMule exactly.
 */
export function useApi() {
  /**
   * Generic fetch wrapper. The sequent_token cookie is sent automatically
   * by the browser; we deliberately do NOT add an Authorization header
   * because that header is reserved for nginx HTTP Basic auth on the
   * reverse proxy.
   */
  async function apiFetch<T = any>(
    path: string,
    opts: Parameters<typeof $fetch>[1] = {},
  ): Promise<T> {
    return await $fetch<T>(path, opts);
  }

  return { apiFetch };
}
