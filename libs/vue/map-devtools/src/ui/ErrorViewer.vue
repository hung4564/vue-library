<template>
  <div class="error-viewer">
    <div class="error-viewer__toolbar">
      <span class="error-viewer__count"
        >Errors {{ filteredErrors.length }}</span
      >
      <div class="error-viewer__actions">
        <MapControlButton variant="text" size="small" @click="clearErrors">
          Clear
        </MapControlButton>
      </div>
    </div>
    <div class="error-viewer__body">
      <div
        v-for="(error, index) in filteredErrors"
        :key="index"
        class="error-viewer__item"
        :class="
          error.recoverable
            ? 'error-viewer__item--recoverable'
            : 'error-viewer__item--fatal'
        "
      >
        <div class="error-viewer__item-header">
          <span class="error-viewer__code">{{ error.code }}</span>
          <span class="error-viewer__time">{{
            formatTime(error.timestamp)
          }}</span>
        </div>
        <div class="error-viewer__message">{{ error.message }}</div>
        <div v-if="errorMapId(error)" class="error-viewer__mapid">
          mapId: {{ errorMapId(error) }}
        </div>
        <div class="error-viewer__actions">
          <MapCopyButton
            title="Copy stack"
            :value="formatDevtoolErrorForCopy(error)"
          />
        </div>
        <details v-if="error.context" class="error-viewer__details">
          <summary>Context</summary>
          <pre>{{ JSON.stringify(error.context, null, 2) }}</pre>
        </details>
        <details v-if="error.stack" class="error-viewer__details">
          <summary>Stack Trace</summary>
          <pre>{{ error.stack }}</pre>
        </details>
      </div>
      <div v-if="filteredErrors.length === 0" class="error-viewer__empty">
        No errors logged
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  errorMapId,
  filterErrorsByMapId,
  formatDevtoolErrorForCopy,
  formatErrorTime,
} from '@hungpvq/map-debug';
import { MapControlButton, MapCopyButton } from '@hungpvq/vue-map-core';
import { computed } from 'vue';
import { clearDevtoolErrors, useDevtoolState } from '../store';

const { errors, filterMapId } = useDevtoolState();

const filteredErrors = computed(() =>
  filterErrorsByMapId(errors.value, filterMapId.value),
);

function clearErrors() {
  clearDevtoolErrors();
}

function formatTime(timestamp: number): string {
  return formatErrorTime(timestamp);
}
</script>
