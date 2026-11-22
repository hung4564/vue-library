<script lang="ts">
export default { name: 'LogRequestFlowViewer' };
</script>
<script setup lang="ts">
import {
  buildRequestFlowSteps,
  buildRequestFlowTree,
  formatFlowDelta,
  resolveMaybePromise,
  type DebugRecord,
  type LogDataStore,
  type RequestFlowStep,
  type RequestFlowTreeNode,
} from '@hungpvq/shared-log';
import { BaseButton, CopyButton, Tabs, type TabItem } from '@hungpvq/vue-ui-core';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import LogDetailPanel from './LogDetailPanel.vue';
import LogRequestFlowNode from './LogRequestFlowNode.vue';
import DevtoolPanelCard from './ui/DevtoolPanelCard.vue';
import DevtoolPanelSplit from './ui/DevtoolPanelSplit.vue';

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
const matchedLogs = ref<DebugRecord[]>([]);

const modeTabs: TabItem[] = [
  { id: 'tree', label: 'Tree' },
  { id: 'flat', label: 'Flat' },
];

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

function handleKeydown(event: KeyboardEvent) {
  if (props.show && event.key === 'Escape') {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const steps = computed(() => buildRequestFlowSteps(matchedLogs.value));
const tree = computed(() => buildRequestFlowTree(matchedLogs.value));
const flatAsNodes = computed((): RequestFlowTreeNode[] =>
  steps.value.map((step: RequestFlowStep) => ({
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

const totalDurationMs = computed(() => {
  const list = steps.value;
  if (list.length < 2) return null;
  const start = list[0]?.ts;
  const end = list[list.length - 1]?.ts;
  if (start != null && end != null && end >= start) {
    return end - start;
  }
  return null;
});

const hasError = computed(() =>
  steps.value.some(
    (s) => s.level === 'error' || s.phase === 'ERROR',
  ),
);
</script>

<template>
  <div
    v-if="show"
    class="debug-flow-overlay"
    @click.self="emit('close')"
  >
    <div
      class="debug-flow-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="Action flow"
    >
      <div class="debug-flow-viewer__header">
        <div class="debug-flow-viewer__header-left">
          <span class="debug-flow-viewer__title">Action Flow</span>
          <code
            class="debug-flow-viewer__action-id"
            :title="actionId"
          >
            {{ actionId }}
          </code>
          <CopyButton
            :value="actionId"
            title="Copy actionId"
          />
          <span class="debug-flow-viewer__badge">
            {{ nodeCount }} {{ nodeCount === 1 ? 'step' : 'steps' }}
          </span>
          <span
            v-if="totalDurationMs != null"
            class="debug-flow-viewer__badge debug-flow-viewer__badge--time"
          >
            {{ formatFlowDelta(totalDurationMs) }}
          </span>
          <span
            v-if="hasError"
            class="debug-flow-viewer__badge debug-flow-viewer__badge--error"
          >
            Error
          </span>
        </div>
        <div class="debug-flow-viewer__header-right">
          <Tabs
            v-model="viewMode"
            :items="modeTabs"
            :with-panes="false"
          />
          <BaseButton
            variant="text"
            size="small"
            class="debug-flow-viewer__close"
            title="Close (Esc)"
            @click="emit('close')"
          >
            ✕
          </BaseButton>
        </div>
      </div>
      <div class="log-request-flow">
        <DevtoolPanelSplit class="log-request-flow__layout">
          <DevtoolPanelCard class="log-request-flow__tree">
            <ol
              v-if="nodeCount"
              class="log-request-flow__list"
              :class="{ 'log-request-flow__list--flat': viewMode === 'flat' }"
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
          </DevtoolPanelCard>
          <LogDetailPanel :log="selectedLog" />
        </DevtoolPanelSplit>
      </div>
    </div>
  </div>
</template>
