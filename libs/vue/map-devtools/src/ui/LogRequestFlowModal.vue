<script lang="ts">
export default { name: 'log-request-flow-modal' };
</script>
<script setup lang="ts">
import {
  buildRequestFlowSteps,
  buildRequestFlowTree,
  type RequestFlowStep,
  type RequestFlowTreeNode,
  shortActionId,
} from '@hungpvq/map-debug';
import type { LogDataStore, LogRecord } from '@hungpvq/shared-log';
import { resolveMaybePromise } from '@hungpvq/shared-log';
import { DraggableModal } from '@hungpvq/vue-draggable';
import {
  MapControlButton,
  ModuleContainer,
  useMap,
} from '@hungpvq/vue-map-core';
import { computed, ref, watch } from 'vue';

import LogDetailPanel from './LogDetailPanel.vue';
import LogRequestFlowNode from './LogRequestFlowNode.vue';

const props = defineProps<{
  show: boolean;
  actionId: string;
  store: LogDataStore;
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  close: [];
}>();

type ViewMode = 'tree' | 'flat';

const { moduleContainerProps } = useMap({});
const localActiveId = ref<string | null>(null);
const viewMode = ref<ViewMode>('tree');
const matchedLogs = ref<LogRecord[]>([]);

watch(
  () => [props.show, props.actionId] as const,
  ([show]) => {
    if (!show) return;
    localActiveId.value = null;
  },
  { immediate: true },
);

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

const flatSteps = computed(() => buildRequestFlowSteps(matchedLogs.value));

const flatAsNodes = computed((): RequestFlowTreeNode[] =>
  flatSteps.value.map((step: RequestFlowStep) => ({
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

const title = computed(() => `Action flow · ${shortActionId(props.actionId)}`);

function onUpdateShow(value: boolean) {
  emit('update:show', value);
  if (!value) emit('close');
}

function onClose() {
  emit('update:show', false);
  emit('close');
}

function onStepClick(logId: string) {
  localActiveId.value = logId;
}
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="{ containerId }">
      <DraggableModal
        :show="show"
        :title="title"
        :container-id="containerId"
        :width="780"
        :height="560"
        :mask="true"
        :mask-closable="true"
        @update:show="onUpdateShow"
        @close="onClose"
      >
        <div class="log-request-flow">
          <div class="log-request-flow__meta">
            <span>{{ nodeCount }} node{{ nodeCount === 1 ? '' : 's' }}</span>
            <div
              class="log-request-flow__modes"
              role="group"
              aria-label="View mode"
            >
              <MapControlButton
                variant="text"
                size="small"
                :active="viewMode === 'tree'"
                @click="viewMode = 'tree'"
              >
                Tree
              </MapControlButton>
              <MapControlButton
                variant="text"
                size="small"
                :active="viewMode === 'flat'"
                @click="viewMode = 'flat'"
              >
                Flat
              </MapControlButton>
            </div>
            <code>{{ actionId }}</code>
          </div>
          <div class="log-request-flow__layout">
            <div class="log-request-flow__tree">
              <div v-if="nodeCount === 0" class="log-request-flow__empty">
                No logs for this actionId
              </div>
              <ol
                v-else-if="viewMode === 'tree'"
                class="log-request-flow__list"
              >
                <LogRequestFlowNode
                  v-for="node in tree"
                  :key="node.id"
                  :node="node"
                  :depth="0"
                  :active-log-id="selectedLog?.id"
                  @select="onStepClick"
                />
              </ol>
              <ol
                v-else
                class="log-request-flow__list log-request-flow__list--flat"
              >
                <LogRequestFlowNode
                  v-for="node in flatAsNodes"
                  :key="node.id"
                  :node="node"
                  :depth="0"
                  flat
                  :active-log-id="selectedLog?.id"
                  @select="onStepClick"
                />
              </ol>
            </div>
            <LogDetailPanel :log="selectedLog" />
          </div>
        </div>
      </DraggableModal>
    </template>
  </ModuleContainer>
</template>
