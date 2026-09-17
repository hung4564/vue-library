<template>
  <div class="log-viewer">
    <div class="log-viewer__toolbar">
      <span class="log-viewer__count"
        >{{ showingCount }}/{{ totalCount }}</span
      >
      <div class="log-viewer__levels" role="group" aria-label="Level filter">
        <MapControlButton
          v-for="item in levelFilters"
          :key="item"
          variant="text"
          size="small"
          :active="level === item"
          @click="level = item"
        >
          {{ item }}
        </MapControlButton>
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
        <MapCopyButton title="Copy visible logs" :value="visibleCopyText" />
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
      <div v-if="mapIds.length > 1" class="log-viewer__mapid">
        <InputSelect
          v-model="mapId"
          :items="mapFilterItems"
          aria-label="Filter by mapId"
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
        @namespace-click="namespace = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapControlButton, MapCopyButton } from '@hungpvq/vue-map-core';
import {
  InputCheckbox,
  InputSelect,
  InputText,
} from '@hungpvq/vue-map-core/fields';
import {
  formatDevtoolsLogEntryForCopy,
  type BufferingLogEntry as LogEntry,
} from '@hungpvq/map-core/devtools';
import {
  LEVEL_FILTERS,
  buildStructuredLogs,
  collectLogMapIds,
  collectNamespaces,
  collectStructuredLogs,
  countNewLogsWhilePaused,
  displayNamespace,
  filterLogs,
  shortMapId,
  type LevelFilter,
} from '@hungpvq/map-debug';
import { computed, nextTick, ref, watch } from 'vue';
import { clearDevtoolLogs, devtoolState } from '../store';
import LogRenderNode from './LogRenderNode.vue';

const levelFilters = LEVEL_FILTERS;

const logs = computed(() => devtoolState.logs);
const logListRef = ref<HTMLElement | null>(null);
const autoScroll = ref(true);
const paused = ref(false);
const frozenLogs = ref<LogEntry[] | null>(null);
const search = ref('');
const level = ref<LevelFilter>('all');
const namespace = ref('all');
const mapId = ref('all');

const sourceLogs = computed(() =>
  paused.value && frozenLogs.value ? frozenLogs.value : logs.value,
);

const newCount = computed(() =>
  countNewLogsWhilePaused(logs.value, frozenLogs.value, paused.value),
);

const mapIds = computed(() => collectLogMapIds(logs.value));

const mapFilterItems = computed(() => [
  { value: 'all', text: 'All maps' },
  ...mapIds.value.map((id) => ({ value: id, text: shortMapId(id) })),
]);

watch(mapIds, (ids) => {
  if (mapId.value !== 'all' && !ids.includes(mapId.value)) {
    mapId.value = 'all';
  }
});

const namespaces = computed(() =>
  collectNamespaces(logs.value, mapId.value, mapIds.value.length),
);

const namespaceFilterItems = computed(() => [
  { value: 'all', text: 'All namespaces' },
  ...namespaces.value.map((ns) => ({
    value: ns,
    text: displayNamespace(ns),
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
    mapId.value,
    mapIds.value.length,
  ),
);

const structuredLogs = computed(() => buildStructuredLogs(filteredLogs.value));

const totalCount = computed(
  () =>
    sourceLogs.value.filter((l) => l.level !== 'groupCollapsed' && l.level !== 'groupEnd')
      .length,
);
const showingCount = computed(
  () => collectStructuredLogs(structuredLogs.value).length,
);

const hasActiveFilter = computed(() => {
  return (
    Boolean(search.value.trim()) ||
    level.value !== 'all' ||
    namespace.value !== 'all' ||
    (mapIds.value.length > 1 && mapId.value !== 'all')
  );
});

const visibleCopyText = computed(() =>
  collectStructuredLogs(structuredLogs.value)
    .map(formatDevtoolsLogEntryForCopy)
    .join('\n'),
);

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
}

async function scrollLogsToNewest() {
  await nextTick();
  const el = logListRef.value;
  if (el) el.scrollTop = el.scrollHeight;
}

watch(
  () => structuredLogs.value.length,
  () => {
    if (!autoScroll.value || paused.value) return;
    void scrollLogsToNewest();
  },
);

watch([search, level, namespace, mapId], () => {
  void scrollLogsToNewest();
});
</script>
