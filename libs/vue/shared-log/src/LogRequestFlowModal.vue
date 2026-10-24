<script lang="ts">
export default { name: 'log-request-flow-modal' };
</script>
<script setup lang="ts">
import {
  buildRequestFlowSteps,
  buildRequestFlowTree,
  type LogDataStore,
  type LogRecord,
  resolveMaybePromise,
  type RequestFlowStep,
  type RequestFlowTreeNode,
  shortActionId,
} from '@hungpvq/shared-log';
import { BaseButton } from '@hungpvq/vue-ui-core';
import { computed, ref, watch } from 'vue';

import LogDetailPanel from './LogDetailPanel.vue';
import LogRequestFlowNode from './LogRequestFlowNode.vue';

const props = defineProps<{
  show: boolean;
  actionId: string;
  store: LogDataStore;
}>();

const emit = defineEmits<{
  close: [];
}>();

type ViewMode = 'tree' | 'flat';
const localActiveId = ref<string | null>(null);
const viewMode = ref<ViewMode>('tree');
const matchedLogs = ref<LogRecord[]>([]);

let matchGen = 0;
watch(
  () => [props.store, props.actionId, props.show] as const,
  async ([store, actionId, show]) => {
    const gen = ++matchGen;
    if (!show || !actionId) {
      matchedLogs.value = [];
      return;
    }
    const rows = await resolveMaybePromise(store.list({ actionId }));
    if (gen !== matchGen) return;
    matchedLogs.value = rows;
  },
  { immediate: true },
);

const tree = computed(() => buildRequestFlowTree(matchedLogs.value));
const flatAsNodes = computed((): RequestFlowTreeNode[] =>
  buildRequestFlowSteps(matchedLogs.value).map((step: RequestFlowStep) => ({
    ...step,
    children: [],
  })),
);
const nodeCount = computed(() => matchedLogs.value.length);
const selectedLog = computed(() => {
  if (!localActiveId.value) return matchedLogs.value[0] ?? null;
  return (
    matchedLogs.value.find((l) => l.id === localActiveId.value) ??
    matchedLogs.value[0] ??
    null
  );
});
</script>

<template>
  <div
    v-if="show"
    class="debug-flow-overlay"
    @click.self="emit('close')"
  >
    <div
      class="debug-flow-modal"
      role="dialog"
      aria-label="Action flow"
    >
      <div class="debug-flow-modal__header">
        <strong>Action flow · {{ shortActionId(actionId) }}</strong>
        <div>
          <BaseButton
            :active="viewMode === 'tree'"
            @click="viewMode = 'tree'"
          >
            Tree
          </BaseButton>
          <BaseButton
            :active="viewMode === 'flat'"
            @click="viewMode = 'flat'"
          >
            Flat
          </BaseButton>
          <BaseButton @click="emit('close')">X</BaseButton>
        </div>
      </div>
      <div class="log-request-flow">
        <div class="log-request-flow__meta">
          <span>{{ nodeCount }} node{{ nodeCount === 1 ? '' : 's' }}</span>
          <code>{{ actionId }}</code>
        </div>
        <div class="log-request-flow__layout">
          <div class="log-request-flow__tree">
            <ol
              v-if="nodeCount"
              class="log-request-flow__list"
            >
              <LogRequestFlowNode
                v-for="node in viewMode === 'tree' ? tree : flatAsNodes"
                :key="node.id"
                :node="node"
                :depth="0"
                :flat="viewMode === 'flat'"
                :active-log-id="selectedLog?.id"
                @select="localActiveId = $event"
              />
            </ol>
            <div
              v-else
              class="log-request-flow__empty"
            >
              No logs for this actionId
            </div>
          </div>
          <LogDetailPanel :log="selectedLog" />
        </div>
      </div>
    </div>
  </div>
</template>
