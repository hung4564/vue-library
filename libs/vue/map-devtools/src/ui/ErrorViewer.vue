<template>
  <div class="error-viewer">
    <div class="error-header">
      <h3>Errors ({{ filteredErrors.length }})</h3>
      <div class="error-header__actions">
        <input
          v-model="mapIdFilter"
          class="error-filter"
          type="search"
          placeholder="Filter mapId"
          aria-label="Filter by mapId"
        />
        <button type="button" class="clear-btn" @click="clearErrors">
          Clear
        </button>
      </div>
    </div>
    <div class="error-list">
      <div
        v-for="(error, index) in filteredErrors"
        :key="index"
        class="error-item"
        :class="`error-${error.recoverable ? 'recoverable' : 'fatal'}`"
      >
        <div class="error-item-header">
          <span class="error-code">{{ error.code }}</span>
          <span class="error-time">{{ formatTime(error.timestamp) }}</span>
        </div>
        <div class="error-message">{{ error.message }}</div>
        <div
          v-if="error.context && (error.context as { mapId?: string }).mapId"
          class="error-mapid"
        >
          mapId: {{ (error.context as { mapId?: string }).mapId }}
        </div>
        <div class="error-item-actions">
          <button type="button" class="copy-btn" @click="copyStack(error)">
            Copy stack
          </button>
        </div>
        <details v-if="error.context" class="error-details">
          <summary>Context</summary>
          <pre>{{ JSON.stringify(error.context, null, 2) }}</pre>
        </details>
        <details v-if="error.stack" class="error-details">
          <summary>Stack Trace</summary>
          <pre>{{ error.stack }}</pre>
        </details>
      </div>
      <div v-if="filteredErrors.length === 0" class="empty-state">
        No errors logged
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { devtoolState } from '../store';

const mapIdFilter = ref('');
const errors = computed(() => devtoolState.errors);
const filteredErrors = computed(() => {
  const q = mapIdFilter.value.trim().toLowerCase();
  if (!q) return errors.value;
  return errors.value.filter((error) => {
    const mapId = String(
      (error.context as { mapId?: string } | undefined)?.mapId ?? '',
    ).toLowerCase();
    return (
      mapId.includes(q) ||
      error.message.toLowerCase().includes(q) ||
      String(error.code ?? '')
        .toLowerCase()
        .includes(q)
    );
  });
});

function clearErrors() {
  devtoolState.errors = [];
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

async function copyStack(error: {
  message: string;
  code?: string;
  stack?: string;
  context?: unknown;
}) {
  const text = [
    error.code,
    error.message,
    error.stack,
    error.context ? JSON.stringify(error.context, null, 2) : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  try {
    await navigator.clipboard?.writeText(text);
  } catch {
    // ignore
  }
}
</script>

<style scoped>
.error-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.error-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.error-header__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.error-filter {
  max-width: 140px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
}

.clear-btn,
.copy-btn {
  padding: 4px 12px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.clear-btn {
  background: #f44336;
}

.copy-btn {
  background: #1976d2;
}

.clear-btn:hover {
  background: #d32f2f;
}

.error-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.error-item {
  margin-bottom: 8px;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid;
  background: #fff;
}

.error-recoverable {
  border-left-color: #ff9800;
  background: #fff3e0;
}

.error-fatal {
  border-left-color: #f44336;
  background: #ffebee;
}

.error-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.error-code {
  font-weight: 600;
  font-size: 12px;
  color: #333;
}

.error-time {
  font-size: 11px;
  color: #666;
}

.error-message {
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
}

.error-mapid {
  font-size: 11px;
  color: #666;
  margin-bottom: 6px;
}

.error-item-actions {
  margin-bottom: 6px;
}

.error-details {
  margin-top: 8px;
  font-size: 11px;
}

.error-details summary {
  cursor: pointer;
  color: #1976d2;
  margin-bottom: 4px;
}

.error-details pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 4px 0 0 0;
  font-size: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}
</style>
