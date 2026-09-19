<template>
  <div class="log-viewer">
    <div class="log-viewer__toolbar">
      <div class="log-viewer__toolbar-main">
        <span class="log-viewer__count"
          >{{ showingCount }}/{{ totalCount }}</span
        >
        <div class="log-viewer__levels" role="group" aria-label="Level filter">
          <MapControlButton
            v-for="item in levelFilters"
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
          class="log-viewer__pause"
          variant="text"
          size="small"
          @click="togglePause"
        >
          {{
            paused
              ? newCount > 0
                ? `Resume (${newCount})`
                : 'Resume'
              : 'Pause'
          }}
        </MapControlButton>
        <MapControlButton variant="text" size="small" @click="clear">
          Clear
        </MapControlButton>
        <InputCheckbox
          class="log-viewer__autoscroll"
          v-model="autoScroll"
          label="Auto-scroll"
          :disabled="paused"
        />
      </div>
    </div>
    <div class="log-viewer__filters">
      <div class="log-viewer__search">
        <InputText
          v-model="search"
          type="search"
          placeholder="Search"
          aria-label="Search logs"
        />
      </div>
      <div class="log-viewer__requestid">
        <InputText
          v-model="requestId"
          type="search"
          placeholder="requestId"
          aria-label="Filter by requestId"
        />
      </div>
      <div class="log-viewer__namespace">
        <InputSelect
          v-model="namespace"
          :items="namespaceFilterItems"
          aria-label="Filter by namespace"
        />
      </div>
    </div>
    <div class="log-viewer__split">
      <div class="log-viewer__body" ref="logListRef">
        <div v-if="structuredLogs.length === 0" class="log-viewer__empty">
          {{
            sourceLogs.length === 0
              ? 'No logs'
              : hasActiveFilter
                ? 'No matching logs'
                : 'No logs'
          }}
        </div>
        <LogRenderNode
          v-for="item in structuredLogs"
          :key="item.id"
          :item="item"
          :selected-id="selectedId"
          @namespace-click="namespace = $event"
          @request-id-click="requestId = $event"
          @flow-click="onFlowClick"
          @select="onSelect"
        />
      </div>
      <LogDetailPanel :log="selectedLog" />
    </div>
    <LogRequestFlowModal
      v-if="flowRequestId && flowMapId"
      v-model:show="flowOpen"
      :request-id="flowRequestId"
      :map-id="flowMapId"
      :logs="sourceLogs"
      :active-log-id="selectedId"
    />
  </div>
</template>

<script setup lang="ts">
import { MapControlButton } from '@hungpvq/vue-map-core';
import {
  InputCheckbox,
  InputSelect,
  InputText,
} from '@hungpvq/vue-map-core/fields';
import {
  resolveMapDragContainerId,
  type BufferingLogEntry as LogEntry,
} from '@hungpvq/map-core/devtools';
import {
  LEVEL_FILTERS,
  buildStructuredLogs,
  collectNamespaces,
  collectStructuredLogs,
  countNewLogsWhilePaused,
  filterLogs,
  logMapId,
  type LevelFilter,
  type StructuredItem,
} from '@hungpvq/map-debug';
import { computed, nextTick, ref, watch } from 'vue';
import { clearDevtoolLogs, useDevtoolState } from '../store';
import LogDetailPanel from './LogDetailPanel.vue';
import LogRenderNode from './LogRenderNode.vue';
import LogRequestFlowModal from './LogRequestFlowModal.vue';

const levelFilters = LEVEL_FILTERS;

const { logs, filterMapId } = useDevtoolState();
const logListRef = ref<HTMLElement | null>(null);
const autoScroll = ref(true);
const paused = ref(false);
const frozenLogs = ref<LogEntry[] | null>(null);
const search = ref('');
const requestId = ref('');
const level = ref<LevelFilter>('all');
const namespace = ref('all');
const selectedId = ref<string | null>(null);
const flowOpen = ref(false);
const flowRequestId = ref<string | null>(null);

const sourceLogs = computed(() =>
  paused.value && frozenLogs.value ? frozenLogs.value : logs.value,
);

const newCount = computed(() =>
  countNewLogsWhilePaused(logs.value, frozenLogs.value, paused.value),
);

const namespaces = computed(() =>
  collectNamespaces(logs.value, filterMapId.value, 2),
);

const namespaceFilterItems = computed(() => [
  { value: 'all', text: 'All namespaces' },
  ...namespaces.value.map((ns) => ({
    value: ns,
    text: ns,
  })),
]);

watch(namespaces, (ns) => {
  if (namespace.value !== 'all' && !ns.includes(namespace.value)) {
    namespace.value = 'all';
  }
});

const filteredLogs = computed(() =>
  filterLogs(
    sourceLogs.value,
    search.value,
    level.value,
    namespace.value,
    filterMapId.value,
    2,
    requestId.value,
  ),
);

const structuredLogs = computed(() => buildStructuredLogs(filteredLogs.value));

const selectedLog = computed(() => {
  if (!selectedId.value) return null;
  return (
    sourceLogs.value.find((l) => l.id === selectedId.value) ??
    filteredLogs.value.find((l) => l.id === selectedId.value) ??
    null
  );
});

const flowMapId = computed(() => {
  if (filterMapId.value !== 'all') return filterMapId.value;
  if (selectedLog.value) return logMapId(selectedLog.value);
  const first = flowRequestId.value
    ? sourceLogs.value.find((l) => l.header.requestId === flowRequestId.value)
    : null;
  return first ? logMapId(first) : null;
});

const totalCount = computed(() => sourceLogs.value.length);
const showingCount = computed(
  () => collectStructuredLogs(structuredLogs.value).length,
);

const hasActiveFilter = computed(() => {
  return (
    Boolean(search.value.trim()) ||
    Boolean(requestId.value.trim()) ||
    level.value !== 'all' ||
    namespace.value !== 'all' ||
    filterMapId.value !== 'all'
  );
});

function onSelect(item: StructuredItem) {
  if (item.type !== 'log') return;
  selectedId.value = item.id;
}

function onFlowClick(reqId: string) {
  flowRequestId.value = reqId;
  const match = sourceLogs.value.find((l) => l.header.requestId === reqId);
  const mapId =
    filterMapId.value !== 'all'
      ? filterMapId.value
      : match
        ? logMapId(match)
        : selectedLog.value
          ? logMapId(selectedLog.value)
          : null;
  if (!mapId) return;
  if (
    typeof document !== 'undefined' &&
    !document.getElementById(
      `modal-layer-${resolveMapDragContainerId(null, mapId)}`,
    )
  ) {
    return;
  }
  flowOpen.value = true;
}

function togglePause() {
  if (paused.value) {
    paused.value = false;
    frozenLogs.value = null;
  } else {
    frozenLogs.value = [...logs.value];
    paused.value = true;
  }
}

function clear() {
  clearDevtoolLogs();
  frozenLogs.value = paused.value ? [] : null;
  selectedId.value = null;
  flowOpen.value = false;
  flowRequestId.value = null;
}

async function scrollLogsToTop() {
  await nextTick();
  const el = logListRef.value;
  if (el) el.scrollTop = 0;
}

watch(
  () => structuredLogs.value.length,
  () => {
    if (!autoScroll.value || paused.value) return;
    void scrollLogsToTop();
  },
);

watch([search, requestId, level, namespace, filterMapId], () => {
  void scrollLogsToTop();
});
</script>
