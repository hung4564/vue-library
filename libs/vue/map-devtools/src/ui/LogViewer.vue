<template>
  <div class="log-viewer">
    <div class="log-viewer__toolbar">
      <div class="log-viewer__toolbar-main">
        <span class="log-viewer__count"
          >{{ listed.length }}/{{ totalCount }}</span
        >
        <div class="log-viewer__levels" role="group" aria-label="Level filter">
          <MapControlButton
            v-for="item in LEVEL_FILTERS"
            :key="item"
            variant="text"
            size="small"
            class="log-viewer__level"
            :active="level === item"
            @click="level = item"
          >
            {{ item }}
          </MapControlButton>
        </div>
      </div>
      <div class="log-viewer__actions">
        <MapControlButton
          variant="text"
          size="small"
          title="Refresh logs from store"
          :disabled="refreshPhase === 'loading'"
          @click="onRefresh"
        >
          {{ refreshLabel }}
        </MapControlButton>
        <MapControlButton variant="text" size="small" @click="clear">
          Clear
        </MapControlButton>
        <InputCheckbox
          class="log-viewer__autoscroll"
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
      <div
        class="log-viewer__namespace"
        :class="{ 'log-viewer__namespace--filtered': namespace !== 'all' }"
      >
        <InputSelect
          v-model="namespace"
          :items="namespaceFilterItems"
          aria-label="Filter by namespace"
        />
        <button
          v-if="namespace !== 'all'"
          type="button"
          class="log-viewer__namespace-clear"
          title="Clear namespace filter"
          aria-label="Clear namespace filter"
          @click="namespace = 'all'"
        >
          ✕
        </button>
      </div>
    </div>
    <div class="log-viewer__split">
      <div class="log-viewer__body" ref="logListRef">
        <div v-if="listed.length === 0" class="log-viewer__empty">
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
  type ActionFeedbackPhase,
  createActionFeedback,
} from '@hungpvq/map-core';
import {
  getDevtoolLogDataStore,
  refreshDevtoolLogsFromStore,
} from '@hungpvq/map-core/devtools';
import { LEVEL_FILTERS, type LevelFilter } from '@hungpvq/map-debug';
import {
  logMapId,
  type LogRecord,
  resolveMaybePromise,
  rootNamespace,
} from '@hungpvq/shared-log';
import { MapControlButton } from '@hungpvq/vue-map-core';
import {
  InputCheckbox,
  InputSelect,
  InputText,
} from '@hungpvq/vue-map-core/fields';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

import { clearDevtoolLogs, useDevtoolState } from '../store';
import LogDetailPanel from './LogDetailPanel.vue';
import LogRenderNode from './LogRenderNode.vue';
import LogRequestFlowModal from './LogRequestFlowModal.vue';

const { logs, filterMapId } = useDevtoolState();
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

const liveStore = getDevtoolLogDataStore();
const totalCount = computed(() => allLogs.value.length);

const refreshFeedback = createActionFeedback({
  onChange: (phase) => {
    refreshPhase.value = phase;
  },
});

onBeforeUnmount(() => refreshFeedback.dispose());

const refreshLabel = computed(() => {
  if (refreshPhase.value === 'loading') return '…';
  if (refreshPhase.value === 'success') return 'Refreshed';
  if (refreshPhase.value === 'error') return 'Failed';
  return 'Refresh';
});

const filterQuery = computed(() => ({
  level: level.value,
  namespace: namespace.value,
  mapId: filterMapId.value,
  actionId: actionId.value,
}));

let loadGen = 0;

async function reloadView() {
  const gen = ++loadGen;
  const query = filterQuery.value;
  const mapId = query.mapId ?? 'all';
  const [listedRows, allRows] = await Promise.all([
    resolveMaybePromise(liveStore.list(query)),
    resolveMaybePromise(liveStore.getAll()),
  ]);
  if (gen !== loadGen) return;

  listed.value = listedRows;
  allLogs.value = allRows;
  const set = new Set<string>();
  for (const log of allRows) {
    if (mapId !== 'all' && logMapId(log) !== mapId) continue;
    const key = rootNamespace(log);
    if (key) set.add(key);
  }
  namespaces.value = [...set].sort();
}

watch(
  [filterQuery, logs],
  () => {
    void reloadView();
  },
  { immediate: true },
);

const namespaceFilterItems = computed(() => [
  { value: 'all', text: 'All namespaces' },
  ...namespaces.value.map((ns) => ({ value: ns, text: ns })),
]);

watch(namespaces, (ns) => {
  if (namespace.value !== 'all' && !ns.includes(namespace.value)) {
    namespace.value = 'all';
  }
});

const selectedLog = computed(() => {
  if (!selectedId.value) return null;
  return (
    listed.value.find((l) => l.id === selectedId.value) ??
    allLogs.value.find((l) => l.id === selectedId.value) ??
    null
  );
});

async function onRefresh() {
  await refreshFeedback.run('refresh', async () => {
    await refreshDevtoolLogsFromStore();
    await reloadView();
  });
}

async function clear() {
  clearDevtoolLogs();
  selectedId.value = null;
  flowActionId.value = null;
}

async function scrollLogsToTop() {
  await nextTick();
  const el = logListRef.value;
  if (el) el.scrollTop = 0;
}

watch(
  () => listed.value.length,
  () => {
    if (!autoScroll.value) return;
    void scrollLogsToTop();
  },
);

watch([actionId, level, namespace, filterMapId], () => {
  void scrollLogsToTop();
});
</script>
