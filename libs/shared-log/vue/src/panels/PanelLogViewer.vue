<template>
  <DevtoolPanelContainer>
    <template #title
      ><DevtoolPanelToolbar>
        <template #title>
          <span class="log-viewer__count">
            {{ listed.length }}/{{ totalCount }}
          </span>
        </template>
        <template #actions>
          <BaseButton
            :disabled="refreshPhase === 'loading'"
            @click="onRefresh"
          >
            {{ refreshLabel }}
          </BaseButton>
          <BaseButton @click="clear">Clear</BaseButton>
          <InputCheckbox
            v-model="autoScroll"
            label="Auto-scroll"
        /></template>
      </DevtoolPanelToolbar>
    </template>
    <div class="log-viewer__container">
      <div class="log-viewer__filters">
        <div class="log-viewer__requestid">
          <InputText
            v-model="actionId"
            type="search"
            placeholder="actionId"
            aria-label="Filter by actionId"
          />
        </div>
        <div class="log-viewer__namespace">
          <InputSelect
            v-model="namespace"
            aria-label="Filter by namespace"
            :items="namespaceItems"
          />
        </div>
      </div>
      <DevtoolPanelSplit class="log-viewer__split">
        <DevtoolPanelCard
          class="log-viewer__body"
          ref="logListRef"
        >
          <div
            v-if="listed.length === 0"
            class="log-viewer__empty"
          >
            {{ logs.length === 0 ? 'No logs' : 'No matching logs' }}
          </div>
          <LogRenderNode
            v-for="log in listed"
            :key="log.id"
            :log="log"
            :selected-id="selectedId"
            @namespace-click="namespace = $event"
            @action-id-click="actionId = $event"
            @flow-click="flowActionId = $event"
            @select="selectedId = $event.id"
          />
        </DevtoolPanelCard>
        <LogDetailPanel :log="selectedLog" />
      </DevtoolPanelSplit>
    </div>
    <LogRequestFlowViewer
      v-if="flowActionId"
      :show="true"
      :action-id="flowActionId"
      :store="liveStore"
      @close="flowActionId = null"
    />
  </DevtoolPanelContainer>
</template>

<script setup lang="ts">
import {
  clearDebugLogs,
  getDebugLogDataStore,
  logActionId,
  refreshDebugLogsFromStore,
  rootNamespace,
  type LevelFilter,
} from '@hungpvq/shared-log';
import {
  BaseButton,
  InputCheckbox,
  InputSelect,
  InputText,
} from '@hungpvq/vue-ui-core';
import { computed, nextTick, ref, watch } from 'vue';
import DevtoolPanelCard from '../ui/DevtoolPanelCard.vue';
import DevtoolPanelContainer from '../ui/DevtoolPanelContainer.vue';
import DevtoolPanelSplit from '../ui/DevtoolPanelSplit.vue';
import DevtoolPanelToolbar from '../ui/DevtoolPanelToolbar.vue';

import {
  phaseLabel,
  runWithPhase,
  type ActionFeedbackPhase,
} from '../feedback.js';
import LogDetailPanel from '../LogDetailPanel.vue';
import LogRenderNode from '../LogRenderNode.vue';
import LogRequestFlowViewer from '../LogRequestFlowViewer.vue';
import { useDebugHost } from '../use-debug-host.js';

const { logs } = useDebugHost();
const logListRef = ref<HTMLElement | null>(null);
const autoScroll = ref(true);
const actionId = ref('');
const level = ref<LevelFilter>('all');
const namespace = ref('all');
const selectedId = ref<string | null>(null);
const flowActionId = ref<string | null>(null);
const refreshPhase = ref<ActionFeedbackPhase>('idle');
const liveStore = getDebugLogDataStore();
const listed = computed(() => {
  const action = actionId.value.trim().toLowerCase();
  return logs.value.filter((log) => {
    if (level.value !== 'all' && log.header.level !== level.value) return false;
    if (namespace.value !== 'all' && rootNamespace(log) !== namespace.value) {
      return false;
    }
    if (action && !(logActionId(log) ?? '').toLowerCase().includes(action)) {
      return false;
    }
    return true;
  });
});
const totalCount = computed(() => logs.value.length);
const namespaces = computed(() => {
  const set = new Set<string>();
  for (const log of logs.value) {
    const key = rootNamespace(log);
    if (key) set.add(key);
  }
  return [...set].sort();
});
const namespaceItems = computed(() => [
  { value: 'all', text: 'All namespaces' },
  ...namespaces.value.map((ns) => ({ value: ns, text: ns })),
]);
const refreshLabel = computed(() => phaseLabel(refreshPhase.value, 'Refresh'));

const selectedLog = computed(() => {
  if (!selectedId.value) return null;
  return (
    listed.value.find((l) => l.id === selectedId.value) ??
    logs.value.find((l) => l.id === selectedId.value) ??
    null
  );
});

async function onRefresh() {
  await runWithPhase(
    (phase) => {
      refreshPhase.value = phase;
    },
    async () => {
      await refreshDebugLogsFromStore();
    },
  );
}

function clear() {
  clearDebugLogs();
  selectedId.value = null;
  flowActionId.value = null;
}

watch(
  () => listed.value.length,
  async () => {
    if (!autoScroll.value) return;
    await nextTick();
    if (logListRef.value) logListRef.value.scrollTop = 0;
  },
);
</script>
