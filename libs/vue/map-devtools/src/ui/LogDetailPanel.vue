<script lang="ts">
export default { name: 'log-detail-panel' };
</script>
<script setup lang="ts">
import type { LogRecord } from '@hungpvq/shared-log';
import {
  formatLogTime,
  objectArgs,
  stringifyLogRecord,
  textMessage,
} from '@hungpvq/map-debug';
import { MapCopyButton } from '@hungpvq/vue-map-core';
import { computed } from 'vue';
import TreeItem from './TreeItem.vue';

const props = defineProps<{
  log: LogRecord | null;
  /** Show close control in the header. */
  showClose?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const title = computed(() => {
  if (!props.log) return 'Log detail';
  return textMessage(props.log) || props.log.header.fn || props.log.header.span || 'Log';
});

const json = computed(() =>
  props.log ? stringifyLogRecord(props.log) : '',
);

const objects = computed(() => (props.log ? objectArgs(props.log) : []));
</script>

<template>
  <aside class="log-viewer__detail" aria-label="Log details">
    <template v-if="log">
      <div class="log-viewer__detail-h">
        <strong>{{ title }}</strong>
        <div class="log-viewer__detail-h-actions">
          <MapCopyButton title="Copy log JSON" :value="json" />
          <button
            v-if="showClose"
            type="button"
            class="log-viewer__detail-close"
            title="Close"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">Time</span>
        <div class="log-viewer__detail-value">
          {{ formatLogTime(log.header.ts) }}
        </div>
      </div>
      <div v-if="log.header.index != null" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">#</span>
        <div class="log-viewer__detail-value">{{ log.header.index }}</div>
      </div>
      <div v-if="log.header.level" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">Level</span>
        <div class="log-viewer__detail-value">
          {{ log.header.level.toUpperCase() }}
        </div>
      </div>
      <div v-if="textMessage(log)" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">Message</span>
        <div class="log-viewer__detail-value">{{ textMessage(log) }}</div>
      </div>
      <div v-if="log.header.namespaces[0]" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">Namespace</span>
        <div class="log-viewer__detail-value">
          <code class="log-viewer__mono">{{ log.header.namespaces[0] }}</code>
        </div>
        <div class="log-viewer__detail-copy">
          <MapCopyButton
            title="Copy namespace"
            :value="log.header.namespaces[0]"
          />
        </div>
      </div>
      <div v-if="log.header.actionId" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">actionId</span>
        <div class="log-viewer__detail-value">
          <code class="log-viewer__mono">{{ log.header.actionId }}</code>
        </div>
        <div class="log-viewer__detail-copy">
          <MapCopyButton title="Copy actionId" :value="log.header.actionId" />
        </div>
      </div>
      <div v-if="log.header.spanId" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">spanId</span>
        <div class="log-viewer__detail-value">
          <code class="log-viewer__mono">{{ log.header.spanId }}</code>
        </div>
        <div class="log-viewer__detail-copy">
          <MapCopyButton title="Copy spanId" :value="log.header.spanId" />
        </div>
      </div>
      <div v-if="log.header.parentSpanId" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">parentSpanId</span>
        <div class="log-viewer__detail-value">
          <code class="log-viewer__mono">{{ log.header.parentSpanId }}</code>
        </div>
        <div class="log-viewer__detail-copy">
          <MapCopyButton
            title="Copy parentSpanId"
            :value="log.header.parentSpanId"
          />
        </div>
      </div>
      <div v-if="log.header.requestId" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">requestId (HTTP)</span>
        <div class="log-viewer__detail-value">
          <code class="log-viewer__mono">{{ log.header.requestId }}</code>
        </div>
        <div class="log-viewer__detail-copy">
          <MapCopyButton
            title="Copy HTTP requestId"
            :value="log.header.requestId"
          />
        </div>
      </div>
      <div v-if="log.header.durationMs != null" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">durationMs</span>
        <div class="log-viewer__detail-value">{{ log.header.durationMs }}</div>
      </div>
      <div v-if="log.header.outcome" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">outcome</span>
        <div class="log-viewer__detail-value">{{ log.header.outcome }}</div>
      </div>
      <div v-if="log.header.control" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">Control</span>
        <div class="log-viewer__detail-value">
          <code class="log-viewer__mono">{{ log.header.control }}</code>
        </div>
      </div>
      <div
        v-if="log.header.menuName || log.header.menuId"
        class="log-viewer__detail-row"
      >
        <span class="log-viewer__detail-label">Menu</span>
        <div class="log-viewer__detail-value">
          <template v-if="log.header.menuName">{{
            log.header.menuName
          }}</template>
          <code v-if="log.header.menuId" class="log-viewer__mono">{{
            log.header.menuId
          }}</code>
        </div>
      </div>
      <div v-if="log.header.datasetId" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">Dataset</span>
        <div class="log-viewer__detail-value">
          <code class="log-viewer__mono">{{ log.header.datasetId }}</code>
        </div>
      </div>
      <div v-if="log.header.span" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">Span</span>
        <div class="log-viewer__detail-value">{{ log.header.span }}</div>
      </div>
      <div v-if="log.header.fn" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">fn</span>
        <div class="log-viewer__detail-value">{{ log.header.fn }}</div>
      </div>
      <div v-if="log.header.flowKind" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">flow</span>
        <div class="log-viewer__detail-value">
          {{ log.header.flowKind
          }}<template v-if="log.header.eventName">
            · {{ log.header.eventName }}</template
          >
        </div>
      </div>
      <div v-if="log.header.mapId" class="log-viewer__detail-row">
        <span class="log-viewer__detail-label">mapId</span>
        <div class="log-viewer__detail-value">
          <code class="log-viewer__mono">{{ log.header.mapId }}</code>
        </div>
      </div>
      <div v-if="objects.length" class="log-viewer__detail-args">
        <div class="log-viewer__detail-args-h">Args</div>
        <div
          v-for="(arg, index) in objects"
          :key="index"
          class="log-viewer__detail-arg"
        >
          <TreeItem :data="arg" />
        </div>
      </div>
    </template>
    <div v-else class="log-viewer__detail-empty">Select a log to inspect</div>
  </aside>
</template>
