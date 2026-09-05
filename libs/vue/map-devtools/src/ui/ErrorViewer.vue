<template>
  <div class="error-viewer">
    <div class="error-header">
      <h3>Errors ({{ errors.length }})</h3>
      <button @click="clearErrors" class="clear-btn">Clear</button>
    </div>
    <div class="error-list">
      <div
        v-for="(error, index) in errors"
        :key="index"
        class="error-item"
        :class="`error-${error.recoverable ? 'recoverable' : 'fatal'}`"
      >
        <div class="error-item-header">
          <span class="error-code">{{ error.code }}</span>
          <span class="error-time">{{ formatTime(error.timestamp) }}</span>
        </div>
        <div class="error-message">{{ error.message }}</div>
        <details v-if="error.context" class="error-details">
          <summary>Context</summary>
          <pre>{{ JSON.stringify(error.context, null, 2) }}</pre>
        </details>
        <details v-if="error.stack" class="error-details">
          <summary>Stack Trace</summary>
          <pre>{{ error.stack }}</pre>
        </details>
      </div>
      <div v-if="errors.length === 0" class="empty-state">No errors logged</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { devtoolState } from '../store';

const errors = computed(() => devtoolState.errors);

function clearErrors() {
  devtoolState.errors = [];
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
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
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.error-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.clear-btn {
  padding: 4px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
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
