<template>
  <button
    :class="classes"
    :type="nativeType"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="s-btn-spinner"></span>
    <span v-else-if="icon" class="s-btn-icon">{{ icon }}</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: "default" | "primary" | "danger" | "success" | "warning" | "ghost";
    size?: "sm" | "md" | "lg";
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
    block?: boolean;
    nativeType?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "default",
    size: "md",
    nativeType: "button",
  },
);

defineEmits<{ click: [e: MouseEvent] }>();

const classes = computed(() => [
  "s-btn",
  `s-btn--${props.variant}`,
  `s-btn--${props.size}`,
  props.block && "s-btn--block",
]);
</script>

<style scoped>
.s-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
  white-space: nowrap;
  line-height: 1;
}

.s-btn--sm { padding: 0.4rem 0.75rem; font-size: 0.8125rem; }
.s-btn--md { padding: 0.5rem 1rem; font-size: 0.875rem; }
.s-btn--lg { padding: 0.625rem 1.25rem; font-size: 1rem; }

.s-btn--default {
  background: var(--color-bg-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.s-btn--default:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-text-dim);
}

.s-btn--primary {
  background: var(--color-primary);
  color: white;
}
.s-btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.s-btn--danger {
  background: var(--color-danger);
  color: white;
}
.s-btn--danger:hover:not(:disabled) {
  background: var(--color-danger-hover);
}

.s-btn--success {
  background: var(--color-success);
  color: white;
}

.s-btn--warning {
  background: var(--color-warning);
  color: black;
}

.s-btn--ghost {
  background: transparent;
  color: var(--color-text-muted);
}
.s-btn--ghost:hover:not(:disabled) {
  background: var(--color-bg-hover);
  color: var(--color-text);
}

.s-btn--block {
  display: flex;
  width: 100%;
}

.s-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.s-btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.s-btn-icon {
  font-size: 1.1em;
}
</style>
