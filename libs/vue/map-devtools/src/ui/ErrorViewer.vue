<template>
  <div class="error-viewer">
    <div class="error-header">
      <h3>Errors ({{ filteredErrors.length }})</h3>
      <div class="error-header__actions">
        <select
          v-if="mapIds.length > 1"
          v-model="selectedMapId"
          class="error-mapid-select"
          aria-label="Filter by mapId"
        >
          <option value="all">All maps</option>
          <option v-for="id in mapIds" :key="id" :value="id">
            {{ shortMapId(id) }}
          </option>
        </select>
        <MapControlButton variant="text" size="small" @click="clearErrors">
          Clear
        </MapControlButton>
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
          v-if="errorMapId(error)"
          class="error-mapid"
        >
          mapId: {{ errorMapId(error) }}
        </div>
        <div class="error-item-actions">
          <MapControlButton
            variant="text"
            size="small"
            @click="copyStack(error)"
          >
            Copy stack
          </MapControlButton>
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
import { MapControlButton } from '@hungpvq/vue-map-core';
import { computed, ref, watch } from 'vue';
import { devtoolState } from '../store';

type DevtoolError = (typeof devtoolState.errors)[number];

const selectedMapId = ref('all');
const errors = computed(() => devtoolState.errors);

function errorMapId(error: DevtoolError): string | null {
  const id = (error.context as { mapId?: string } | undefined)?.mapId;
  return id ? String(id) : null;
}

function shortMapId(id: string) {
  return id.length > 13 ? `${id.slice(0, 8)}…` : id;
}

const mapIds = computed(() => {
  const set = new Set<string>();
  for (const error of errors.value) {
    const id = errorMapId(error);
    if (id) set.add(id);
  }
  return [...set].sort();
});

watch(mapIds, (ids) => {
  if (selectedMapId.value !== 'all' && !ids.includes(selectedMapId.value)) {
    selectedMapId.value = 'all';
  }
});

const filteredErrors = computed(() => {
  if (mapIds.value.length <= 1 || selectedMapId.value === 'all') {
    return errors.value;
  }
  return errors.value.filter(
    (error) => errorMapId(error) === selectedMapId.value,
  );
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

.error-mapid-select {
  max-width: 160px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  background: #fff;
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
