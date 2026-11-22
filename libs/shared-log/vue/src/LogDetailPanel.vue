<script lang="ts">
export default { name: 'log-detail-panel' };
</script>
<script setup lang="ts">
import {
  debugHeaderRows,
  stringifyDebugRecord,
  textMessage,
  type DebugRecord,
} from '@hungpvq/shared-log';
import { computed } from 'vue';

import { BaseButton, CopyButton, TreeItem } from '@hungpvq/vue-ui-core';

const props = defineProps<{
  log: DebugRecord | null;
  showClose?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const title = computed(() => {
  if (!props.log) return 'Detail';
  return (
    textMessage(props.log) ||
    props.log.header.fn ||
    props.log.header.span ||
    'Record'
  );
});

const json = computed(() => (props.log ? stringifyDebugRecord(props.log) : ''));
const rows = computed(() => (props.log ? debugHeaderRows(props.log) : []));
</script>

<template>
  <aside
    class="log-viewer__detail"
    aria-label="Record details"
  >
    <template v-if="log">
      <div class="log-viewer__detail-h">
        <strong>{{ title }}</strong>
        <div class="log-viewer__detail-h-actions">
          <CopyButton
            title="Copy JSON"
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
        v-for="row in rows"
        :key="row.key"
        class="log-viewer__detail-row"
      >
        <span class="log-viewer__detail-label">{{ row.key }}</span>
        <div class="log-viewer__detail-value">
          <code class="log-viewer__mono">{{ row.value }}</code>
        </div>
      </div>
      <div class="log-viewer__detail-args">
        <div class="log-viewer__detail-args-h">data</div>
        <div class="log-viewer__detail-arg">
          <TreeItem :data="log.data" />
        </div>
      </div>
    </template>
    <div
      v-else
      class="log-viewer__detail-empty"
    >
      Select a record to inspect
    </div>
  </aside>
</template>



