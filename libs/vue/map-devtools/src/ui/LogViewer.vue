<template>
  <div class="log-viewer">
    <div class="log-viewer__toolbar">
      <div class="log-viewer__toolbar-row">
        <input
          v-model="search"
          type="search"
          class="log-viewer__search"
          placeholder="Search"
          aria-label="Search logs"
        />
        <select
          v-if="mapIds.length > 1"
          v-model="mapId"
          class="log-viewer__mapid"
          aria-label="Filter by mapId"
        >
          <option value="all">All maps</option>
          <option v-for="id in mapIds" :key="id" :value="id">
            {{ shortMapId(id) }}
          </option>
        </select>
        <select
          v-model="namespace"
          class="log-viewer__namespace"
          aria-label="Filter by namespace"
        >
          <option value="all">All namespaces</option>
          <option v-for="ns in namespaces" :key="ns" :value="ns">
            {{ displayNamespace(ns) }}
          </option>
        </select>
        <span class="log-viewer__count">{{ showingCount }}/{{ totalCount }}</span>
      </div>
      <div class="log-viewer__toolbar-row">
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
          <MapControlButton variant="text" size="small" @click="togglePause">
            {{
              paused
                ? newCount > 0
                  ? `Resume (${newCount})`
                  : 'Resume'
                : 'Pause'
            }}
          </MapControlButton>
          <MapControlButton variant="text" size="small" @click="copyVisible">
            Copy visible
          </MapControlButton>
          <MapControlButton variant="text" size="small" @click="clear">
            Clear
          </MapControlButton>
          <label class="log-viewer__autoscroll">
            <input type="checkbox" v-model="autoScroll" :disabled="paused" />
            Auto-scroll
          </label>
        </div>
      </div>
    </div>
    <div class="log-viewer__list" ref="logListRef">
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
import { MapControlButton } from '@hungpvq/vue-map-core';
import type { LogLevel } from '@hungpvq/shared-log';
import { computed, nextTick, ref, watch } from 'vue';
import type { LogEntry } from '../log-adapter';
import { clearDevtoolLogs, devtoolState } from '../store';
import LogRenderNode, {
  type StructuredGroup,
  type StructuredItem,
  type StructuredLog,
} from './LogRenderNode.vue';

type LevelFilter = 'all' | 'error' | 'warn' | 'info' | 'debug';

const levelFilters: LevelFilter[] = [
  'all',
  'error',
  'warn',
  'info',
  'debug',
];

const GROUP_LEVELS = new Set<LogLevel>(['groupCollapsed', 'groupEnd']);
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const logs = computed(() => devtoolState.logs);
const logListRef = ref<HTMLElement | null>(null);
const autoScroll = ref(true);
const paused = ref(false);
const frozenLogs = ref<LogEntry[] | null>(null);
const search = ref('');
const level = ref<LevelFilter>('all');
const namespace = ref('all');
const mapId = ref('all');

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString();
}

function logMapId(log: LogEntry): string | null {
  if (log.namespaces.length > 0 && UUID_RE.test(log.namespaces[0])) {
    return log.namespaces[0];
  }
  return null;
}

function shortMapId(id: string) {
  return id.length > 13 ? `${id.slice(0, 8)}…` : id;
}

function formatArg(arg: unknown) {
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function namespaceKey(log: LogEntry) {
  return log.namespaces.join(':');
}

function displayNamespace(full: string) {
  const parts = full.split(':');
  if (parts.length > 1 && UUID_RE.test(parts[0])) {
    return parts.slice(1).join(':');
  }
  return full;
}

function entryText(log: LogEntry) {
  return [
    log.level,
    namespaceKey(log),
    ...log.args.map((arg) => formatArg(arg)),
  ]
    .join(' ')
    .toLowerCase();
}

function formatEntryForCopy(log: LogEntry) {
  const ns = namespaceKey(log);
  const args = log.args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    })
    .join(' ');
  return `${formatTime(log.timestamp)} [${(log.level || 'unknown').toUpperCase()}]${ns ? ` [${ns}]` : ''} ${args}`.trim();
}

async function copyText(text: string) {
  try {
    await navigator.clipboard?.writeText(text);
  } catch {
    // ignore
  }
}

function filterLogs(
  list: LogEntry[],
  searchValue: string,
  levelValue: LevelFilter,
  namespaceValue: string,
  mapIdValue: string,
  mapIdCount: number,
): LogEntry[] {
  const q = searchValue.trim().toLowerCase();
  const mapFilterActive = mapIdCount > 1 && mapIdValue !== 'all';
  const hasFilter =
    Boolean(q) ||
    levelValue !== 'all' ||
    namespaceValue !== 'all' ||
    mapFilterActive;

  return list.filter((log) => {
    if (GROUP_LEVELS.has(log.level)) {
      return !hasFilter;
    }
    if (levelValue !== 'all' && log.level !== levelValue) return false;
    if (mapFilterActive && logMapId(log) !== mapIdValue) return false;
    if (namespaceValue !== 'all' && namespaceKey(log) !== namespaceValue)
      return false;
    if (q && !entryText(log).includes(q)) return false;
    return true;
  });
}

function buildStructuredLogs(list: LogEntry[]): StructuredItem[] {
  const stack: StructuredGroup[] = [];
  const root: StructuredItem[] = [];

  list.forEach((log) => {
    if (log.level === 'groupCollapsed') {
      const group: StructuredGroup = {
        id: log.id,
        type: 'group',
        title: log.args.map((a) => String(a)).join(' '),
        collapsed: true,
        children: [],
      };

      if (stack.length > 0) stack[stack.length - 1].children.push(group);
      else root.push(group);

      stack.push(group);
      return;
    }

    if (log.level === 'groupEnd') {
      stack.pop();
      return;
    }

    const entry: StructuredLog = { id: log.id, type: 'log', log };

    if (stack.length > 0) stack[stack.length - 1].children.push(entry);
    else root.push(entry);
  });

  return root;
}

function collectStructuredLogs(items: StructuredItem[]): LogEntry[] {
  const out: LogEntry[] = [];
  for (const item of items) {
    if (item.type === 'log') out.push(item.log);
    else out.push(...collectStructuredLogs(item.children));
  }
  return out;
}

const sourceLogs = computed(() =>
  paused.value && frozenLogs.value ? frozenLogs.value : logs.value,
);

const newCount = computed(() => {
  if (!paused.value || !frozenLogs.value) return 0;
  const frozenIds = new Set(frozenLogs.value.map((l) => l.id));
  return logs.value.reduce((n, l) => n + (frozenIds.has(l.id) ? 0 : 1), 0);
});

const mapIds = computed(() => {
  const set = new Set<string>();
  for (const log of logs.value) {
    if (GROUP_LEVELS.has(log.level)) continue;
    const id = logMapId(log);
    if (id) set.add(id);
  }
  return [...set].sort();
});

watch(mapIds, (ids) => {
  if (mapId.value !== 'all' && !ids.includes(mapId.value)) {
    mapId.value = 'all';
  }
});

const namespaces = computed(() => {
  const set = new Set<string>();
  const mapFilterActive = mapIds.value.length > 1 && mapId.value !== 'all';
  for (const log of logs.value) {
    if (GROUP_LEVELS.has(log.level)) continue;
    if (mapFilterActive && logMapId(log) !== mapId.value) continue;
    const key = namespaceKey(log);
    if (key) set.add(key);
  }
  return [...set].sort();
});

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

const showingCount = computed(
  () => filteredLogs.value.filter((l) => !GROUP_LEVELS.has(l.level)).length,
);

const totalCount = computed(
  () => sourceLogs.value.filter((l) => !GROUP_LEVELS.has(l.level)).length,
);

const hasActiveFilter = computed(
  () =>
    search.value.trim().length > 0 ||
    level.value !== 'all' ||
    namespace.value !== 'all' ||
    (mapIds.value.length > 1 && mapId.value !== 'all'),
);

function clear() {
  if (paused.value) {
    paused.value = false;
    frozenLogs.value = null;
  }
  clearDevtoolLogs();
}

function togglePause() {
  if (paused.value) {
    paused.value = false;
    frozenLogs.value = null;
    return;
  }
  frozenLogs.value = [...logs.value];
  paused.value = true;
}

function copyVisible() {
  const entries = collectStructuredLogs(structuredLogs.value);
  void copyText(entries.map(formatEntryForCopy).join('\n'));
}

watch(
  () => logs.value.length,
  () => {
    if (!autoScroll.value || paused.value) return;

    nextTick(() => {
      requestAnimationFrame(() => {
        const list = logListRef.value;
        if (list) list.scrollTop = 0;
      });
    });
  },
);
</script>

<style scoped>
.log-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.log-viewer__toolbar {
  padding: 8px;
  border-bottom: 1px solid var(--map-divider-color, #e8e8e8);
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
  background: #fafafa;
}

.log-viewer__toolbar-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.log-viewer__search,
.log-viewer__namespace,
.log-viewer__mapid {
  font: inherit;
  font-size: 12px;
  padding: 4px 8px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #fff;
  color: inherit;
}

.log-viewer__search {
  flex: 1 1 140px;
  min-width: 120px;
}

.log-viewer__mapid {
  flex: 0 1 140px;
  max-width: 160px;
}

.log-viewer__namespace {
  flex: 1 1 160px;
  max-width: 280px;
}

.log-viewer__count {
  font-size: 11px;
  color: #80868b;
  white-space: nowrap;
  margin-left: auto;
}

.log-viewer__levels {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.log-viewer__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  align-items: center;
  margin-left: auto;
}

.log-viewer__autoscroll {
  font-size: 12px;
  color: #5f6368;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  user-select: none;
}

.log-viewer__list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 6px;
  min-height: 0;
  background: #fff;
}

.log-viewer__empty {
  text-align: center;
  padding: 32px 12px;
  color: #9aa0a6;
  font-size: 13px;
}
</style>
