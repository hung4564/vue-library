<template>
  <DevtoolPanelContainer>
    <template #title>
      <DevtoolPanelToolbar>
        <template #title>{{ errors.length }} Errors</template>
        <template #actions>
          <BaseButton @click="clearDebugErrors">Clear</BaseButton>
        </template>
      </DevtoolPanelToolbar>
    </template>
    <div
      v-for="(error, index) in errors"
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
          formatErrorTime(error.timestamp)
        }}</span>
      </div>
      <div class="error-viewer__message">{{ error.message }}</div>
      <div
        v-if="errorContextId(error)"
        class="error-viewer__mapid"
      >
        mapId: {{ errorContextId(error) }}
      </div>
      <div class="error-viewer__actions">
        <CopyButton
          title="Copy stack"
          :value="formatDebugErrorForCopy(error)"
        />
      </div>
      <details
        v-if="error.context"
        class="error-viewer__details"
      >
        <summary>Context</summary>
        <pre>{{ JSON.stringify(error.context, null, 2) }}</pre>
      </details>
      <details
        v-if="error.stack"
        class="error-viewer__details"
      >
        <summary>Stack Trace</summary>
        <pre>{{ error.stack }}</pre>
      </details>
    </div>
    <div
      v-if="errors.length === 0"
      class="error-viewer__empty"
    >
      No errors logged
    </div>
  </DevtoolPanelContainer>
</template>

<script setup lang="ts">
import {
  clearDebugErrors,
  errorContextId,
  formatDebugErrorForCopy,
  formatErrorTime,
} from '@hungpvq/shared-log';
import { BaseButton, CopyButton } from '@hungpvq/vue-ui-core';
import DevtoolPanelContainer from '../ui/DevtoolPanelContainer.vue';
import DevtoolPanelToolbar from '../ui/DevtoolPanelToolbar.vue';
import { useDebugHost } from '../use-debug-host.js';

const { errors } = useDebugHost();
</script>
