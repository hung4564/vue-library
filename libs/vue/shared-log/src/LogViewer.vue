<template>
  <div class="log-viewer">
    <div class="log-viewer__toolbar">
      <div class="log-viewer__toolbar-main">
        <span class="log-viewer__count"
          >{{ listed.length }}/{{ totalCount }}</span
        >
        <div
          class="log-viewer__levels"
          role="group"
          aria-label="Level filter"
        >
          <BaseButton
            v-for="item in LEVEL_FILTERS"
            :key="item"
            class="log-viewer__level"
            :active="level === item"
            @click="level = item"
          >
            {{ item }}
          </BaseButton>
        </div>
      </div>
      <div class="log-viewer__actions">
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
        />
      </div>
    </div>
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
    <div class="log-viewer__split">
      <div
        class="log-viewer__body"
        ref="logListRef"
      >
        <div
          v-if="listed.length === 0"
          class="log-viewer__empty"
        >
          {{ totalCount === 0 ? 'No logs' : 'No matching logs' }}
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
      </div>
      <LogDetailPanel :log="selectedLog" />
    </div>
    <LogRequestFlowModal
      v-if="flowActionId"
      :show="true"
      :action-id="flowActionId"
      :store="liveStore"
      @close="flowActionId = null"
    />
  </div>
</template>

<script setup lang="ts">
import {
  clearDebugLogs,
  getDebugLogDataStore,
  LEVEL_FILTERS,
  type LevelFilter,
  type LogRecord,
  refreshDebugLogsFromStore,
  resolveMaybePromise,
  rootNamespace,
} from '@hungpvq/shared-log';
import { BaseButton, InputCheckbox, InputSelect, InputText } from '@hungpvq/vue-ui-core';
import { computed, nextTick, ref, watch } from 'vue';

import { phaseLabel, runWithPhase, type ActionFeedbackPhase } from './feedback';
import LogDetailPanel from './LogDetailPanel.vue';
import LogRenderNode from './LogRenderNode.vue';
import LogRequestFlowModal from './LogRequestFlowModal.vue';
import { useDebugHost } from './use-debug-host';

const { logs } = useDebugHost();
const logListRef = ref<HTMLElement | null>(null);
const autoScroll = ref(true);
const actionId = ref('');
const level = ref<LevelFilter>('all');
const namespace = ref('all');
const selectedId = ref<string | null>(null);
const flowActionId = ref<string | null>(null);
const refreshPhase = ref<ActionFeedbackPhase>('idle');
const listed = ref<LogRecord[]>([]);
const allLogs = ref<LogRecord[]>([]);
const namespaces = ref<string[]>([]);
const liveStore = getDebugLogDataStore();
const totalCount = computed(() => allLogs.value.length);
const namespaceItems = computed(() => [
  { value: 'all', text: 'All namespaces' },
  ...namespaces.value.map((ns) => ({ value: ns, text: ns })),
]);
const refreshLabel = computed(() => phaseLabel(refreshPhase.value, 'Refresh'));

const filterQuery = computed(() => ({
  level: level.value,
  namespace: namespace.value,
  actionId: actionId.value,
}));

let loadGen = 0;
async function reloadView() {
  const gen = ++loadGen;
  const [listedRows, allRows] = await Promise.all([
    resolveMaybePromise(liveStore.list(filterQuery.value)),
    resolveMaybePromise(liveStore.getAll()),
  ]);
  if (gen !== loadGen) return;
  listed.value = listedRows;
  allLogs.value = allRows;
  const set = new Set<string>();
  for (const log of allRows) {
    const key = rootNamespace(log);
    if (key) set.add(key);
  }
  namespaces.value = [...set].sort();
}

watch([filterQuery, logs], () => void reloadView(), { immediate: true });

const selectedLog = computed(() => {
  if (!selectedId.value) return null;
  return (
    listed.value.find((l) => l.id === selectedId.value) ??
    allLogs.value.find((l) => l.id === selectedId.value) ??
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
      await reloadView();
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
