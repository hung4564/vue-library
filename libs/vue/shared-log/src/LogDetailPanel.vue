<script lang="ts">
export default { name: 'log-detail-panel' };
</script>
<script setup lang="ts">
import {
  formatLogTime,
  objectArgs,
  stringifyLogRecord,
  textMessage,
  type LogRecord,
} from '@hungpvq/shared-log';
import { computed } from 'vue';

import { BaseButton, CopyButton } from '@hungpvq/vue-ui-core';
import TreeItem from './TreeItem.vue';

const props = defineProps<{
  log: LogRecord | null;
  showClose?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const title = computed(() => {
  if (!props.log) return 'Log detail';
  return (
    textMessage(props.log) ||
    props.log.header.fn ||
    props.log.header.span ||
    'Log'
  );
});

const json = computed(() => (props.log ? stringifyLogRecord(props.log) : ''));
const objects = computed(() => (props.log ? objectArgs(props.log) : []));
</script>

<template>
  <aside
    class="log-viewer__detail"
    aria-label="Log details"
  >
    <template v-if="log">
      <div class="log-viewer__detail-h">
        <strong>{{ title }}</strong>
        <div class="log-viewer__detail-h-actions">
          <CopyButton
            title="Copy log JSON"
            :value="json"
          />
          <BaseButton
            v-if="showClose"
            class="log-viewer__detail-close"
            title="Close"
            @click="emit('close')"
          >
            ✕
          </BaseButton>
        </div>
      </div>
      <div
        v-if="log.header.level"
        class="log-viewer__detail-row"
      >
        <span class="log-viewer__detail-label">Level</span>
        <div class="log-viewer__detail-value">
          {{ log.header.level.toUpperCase() }}
        </div>
      </div>
      <div
        v-if="textMessage(log)"
        class="log-viewer__detail-row"
      >
        <span class="log-viewer__detail-label">Message</span>
        <div class="log-viewer__detail-value">{{ textMessage(log) }}</div>
      </div>
      <div
        v-if="log.header.actionId"
        class="log-viewer__detail-row"
      >
        <span class="log-viewer__detail-label">actionId</span>
        <div class="log-viewer__detail-value">
          <code class="log-viewer__mono">{{ log.header.actionId }}</code>
        </div>
      </div>
      <div
        v-if="log.header.fn"
        class="log-viewer__detail-row"
      >
        <span class="log-viewer__detail-label">fn</span>
        <div class="log-viewer__detail-value">{{ log.header.fn }}</div>
      </div>
      <div
        v-if="log.header.mapId"
        class="log-viewer__detail-row"
      >
        <span class="log-viewer__detail-label">mapId</span>
        <div class="log-viewer__detail-value">
          <code class="log-viewer__mono">{{ log.header.mapId }}</code>
        </div>
      </div>
      <div
        v-if="objects.length"
        class="log-viewer__detail-args"
      >
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
    <div
      v-else
      class="log-viewer__detail-empty"
    >
      Select a log to inspect
    </div>
  </aside>
</template>
