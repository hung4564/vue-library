<script setup lang="ts">
import { MapControlButton } from '@hungpvq/vue-map-core';
import type { LogEntry } from '../log-adapter';
import GroupItem from './GroupItem.vue';
import TreeItem from './TreeItem.vue';

export type StructuredGroup = {
  id: string;
  type: 'group';
  title: string;
  collapsed: boolean;
  children: StructuredItem[];
};

export type StructuredLog = {
  id: string;
  type: 'log';
  log: LogEntry;
};

export type StructuredItem = StructuredGroup | StructuredLog;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const props = defineProps<{
  item: StructuredItem;
}>();

const emit = defineEmits<{
  'namespace-click': [namespace: string];
}>();

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString();
}

function isObject(val: unknown) {
  return val !== null && typeof val === 'object';
}

function formatArg(arg: unknown) {
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function namespaceParts(namespaces: string[]) {
  if (namespaces.length > 1 && UUID_RE.test(namespaces[0])) {
    return {
      full: namespaces.join(':'),
      path: namespaces.slice(1).join(':'),
      mapId: namespaces[0],
    };
  }
  return {
    full: namespaces.join(':'),
    path: namespaces.join(':'),
    mapId: null as string | null,
  };
}

function formatEntryForCopy(log: LogEntry) {
  const ns = log.namespaces.join(':');
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

function levelLetter(level: string) {
  return (level || '?').charAt(0).toUpperCase();
}

function textMessage(log: LogEntry) {
  const parts = log.args.filter((arg) => !isObject(arg)).map(formatArg);
  return parts.join(' ');
}

function objectArgs(log: LogEntry) {
  return log.args.filter(isObject);
}
</script>

<template>
  <GroupItem
    v-if="item.type === 'group'"
    :title="item.title"
    :collapsed="item.collapsed"
  >
    <LogRenderNode
      v-for="child in item.children"
      :key="child.id"
      :item="child"
      @namespace-click="emit('namespace-click', $event)"
    />
  </GroupItem>

  <div
    v-else
    class="log-entry"
    :class="`log-entry--${item.log.level}`"
  >
    <div class="log-entry__row">
      <span class="log-entry__time">{{ formatTime(item.log.timestamp) }}</span>
      <span
        class="log-entry__level"
        :title="(item.log.level || 'unknown').toUpperCase()"
      >
        {{ levelLetter(item.log.level) }}
      </span>
      <div class="log-entry__content">
        <span v-if="textMessage(item.log)" class="log-entry__msg">{{
          textMessage(item.log)
        }}</span>
        <button
          v-if="namespaceParts(item.log.namespaces).path"
          type="button"
          class="log-entry__ns"
          :title="namespaceParts(item.log.namespaces).full"
          @click="emit('namespace-click', namespaceParts(item.log.namespaces).full)"
        >
          {{ namespaceParts(item.log.namespaces).path }}
        </button>
      </div>
      <MapControlButton
        variant="text"
        size="small"
        class="log-entry__copy"
        @click="copyText(formatEntryForCopy(item.log))"
      >
        Copy
      </MapControlButton>
    </div>
    <div
      v-if="objectArgs(item.log).length"
      class="log-entry__objects"
    >
      <div
        v-for="(arg, index) in objectArgs(item.log)"
        :key="index"
        class="log-entry__object"
      >
        <TreeItem :data="arg" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-entry {
  padding: 2px 4px 4px;
  border-bottom: 1px solid #f0f0f0;
}

.log-entry:hover {
  background: #fafafa;
}

.log-entry__row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.45;
}

.log-entry__time {
  flex: 0 0 auto;
  color: #9aa0a6;
  font-variant-numeric: tabular-nums;
}

.log-entry__level {
  flex: 0 0 0.9em;
  font-weight: 700;
  color: #5f6368;
}

.log-entry--error .log-entry__level {
  color: #c62828;
}

.log-entry--warn .log-entry__level {
  color: #ef6c00;
}

.log-entry--info .log-entry__level {
  color: #1565c0;
}

.log-entry--debug .log-entry__level {
  color: #9aa0a6;
}

.log-entry__content {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  align-items: baseline;
}

.log-entry__msg {
  color: #202124;
  word-break: break-word;
}

.log-entry__ns {
  border: 0;
  padding: 0;
  margin: 0;
  background: none;
  color: #80868b;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-entry__ns:hover {
  color: #1565c0;
  text-decoration: underline;
}

.log-entry__copy {
  flex: 0 0 auto;
  opacity: 0;
}

.log-entry:hover .log-entry__copy,
.log-entry:focus-within .log-entry__copy {
  opacity: 1;
}

.log-entry__objects {
  margin: 2px 0 0 4.6em;
}

.log-entry__object {
  margin-top: 2px;
}
</style>
