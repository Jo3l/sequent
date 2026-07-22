import { inject, type InjectionKey } from "vue";

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

export const TOAST_KEY: InjectionKey<ToastApi> = Symbol("toast");

export function useToast(): ToastApi {
  const api = inject(TOAST_KEY);
  if (!api) {
    // Fallback: just log. The container is usually mounted in the layout.
    return {
      success: (m) => console.log("[toast:success]", m),
      error: (m) => console.error("[toast:error]", m),
      info: (m) => console.info("[toast:info]", m),
    };
  }
  return api;
}
