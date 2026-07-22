<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="`toast--${t.type}`"
        >
          <span class="toast-msg">{{ t.message }}</span>
          <button class="toast-close" @click="dismiss(t.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { TOAST_KEY } from "~/composables/useToast";

export interface Toast {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

const toasts = ref<Toast[]>([]);
let nextId = 1;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function add(type: Toast["type"], message: string) {
  const id = nextId++;
  toasts.value.push({ id, type, message });
  const timer = setTimeout(() => dismiss(id), 4000);
  timers.set(id, timer);
}

function dismiss(id: number) {
  const timer = timers.get(id);
  if (timer) { clearTimeout(timer); timers.delete(id); }
  toasts.value = toasts.value.filter(t => t.id !== id);
}

const toast = { success: (m: string) => add("success", m), error: (m: string) => add("error", m), info: (m: string) => add("info", m) };

defineExpose({ toast });

// Provide globally
provide(TOAST_KEY, toast);
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: var(--shadow-md);
  pointer-events: auto;
  max-width: 380px;
}

.toast--success { background: #16a34a; color: #fff; }
.toast--error   { background: #dc2626; color: #fff; }
.toast--info    { background: var(--color-bg-elevated); color: var(--color-text); border: 1px solid var(--color-border); }

.toast-msg { flex: 1; }

.toast-close {
  flex-shrink: 0;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px;
  font-size: 1.125rem;
  color: inherit;
  opacity: 0.6;
  transition: opacity 0.15s;
}
.toast-close:hover { opacity: 1; }

/* Transitions */
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to   { opacity: 0; transform: translateX(40px); }
</style>
