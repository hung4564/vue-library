<script lang="ts">
export default {
  name: 'MapErrorToast',
};
</script>
<script setup lang="ts">
import { errorHandler, type MapError } from '@hungpvq/map-core';
import { onMounted, onUnmounted, ref } from 'vue';

const OPEN_DEVTOOLS_ERRORS_EVENT = 'hungpvq:map-open-devtools-errors';

const message = ref('');
const visible = ref(false);
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let unsubscribe: (() => void) | undefined;

function showError(error: MapError) {
  message.value = error.message || error.code || 'Map error';
  visible.value = true;
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    visible.value = false;
  }, 8000);
}

function dismiss() {
  visible.value = false;
  if (hideTimer) clearTimeout(hideTimer);
}

function openErrors() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_DEVTOOLS_ERRORS_EVENT));
  }
  dismiss();
}

onMounted(() => {
  unsubscribe = errorHandler.onError(showError);
});
onUnmounted(() => {
  unsubscribe?.();
  if (hideTimer) clearTimeout(hideTimer);
});
</script>

<template>
  <div
    v-if="visible && message"
    class="map-error-toast"
    role="status"
    aria-live="polite"
  >
    <span class="map-error-toast__message">{{ message }}</span>
    <button type="button" class="map-error-toast__action" @click="openErrors">
      Open errors
    </button>
    <button
      type="button"
      class="map-error-toast__dismiss"
      aria-label="Dismiss"
      @click="dismiss"
    >
      ×
    </button>
  </div>
</template>

<style scoped>
.map-error-toast {
  position: fixed;
  left: 50%;
  bottom: var(--map-space-xl, 16px);
  transform: translateX(-50%);
  z-index: 10050;
  display: flex;
  align-items: center;
  gap: var(--map-space-md, 8px);
  max-width: min(480px, calc(100vw - 24px));
  padding: var(--map-space-md, 8px) var(--map-space-lg, 12px);
  border-radius: var(--map-radius-md, 6px);
  background: var(--map-color-surface, #1e1e1e);
  color: var(--map-color-on-surface, #f5f5f5);
  border: 1px solid var(--map-color-border, rgba(255, 255, 255, 0.16));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.28);
  font-size: var(--map-font-size-sm, 13px);
}
.map-error-toast__message {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.map-error-toast__action,
.map-error-toast__dismiss {
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 2px 6px;
}
.map-error-toast__action {
  text-decoration: underline;
}
</style>
