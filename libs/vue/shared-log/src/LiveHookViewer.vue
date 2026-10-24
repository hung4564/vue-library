<template>
  <div class="live-viewer">
    <div class="live-viewer__toolbar">
      <span>{{ instances.length }} instance(s)</span>
      <BaseButton @click="clearLiveTraceEvents">Clear traces</BaseButton>
    </div>
    <div class="live-viewer__split">
      <div class="live-viewer__tree">
        <div
          v-if="roots.length === 0"
          class="live-viewer__empty"
        >
          No live instances. Call useLiveHookDebug() in a component.
        </div>
        <LiveNode
          v-for="node in roots"
          :key="node.id"
          :node="node"
        />
      </div>
      <div class="live-viewer__events">
        <div
          v-for="(event, index) in events"
          :key="`${event.ts}-${index}`"
          class="live-viewer__event"
        >
          {{ event.event }} · {{ event.component }} · #{{ event.renderCount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  clearLiveTraceEvents,
  getLiveTraceEvents,
  getRegisteredInstances,
  type InstanceMetadata,
  subscribeInstances,
  subscribeLiveTrace,
} from '@hungpvq/shared-log';
import { BaseButton } from '@hungpvq/vue-ui-core';
import { onMounted, onUnmounted, ref } from 'vue';

import type { LiveTreeNode } from './live-tree';
import LiveNode from './LiveNode.vue';

const instances = ref<InstanceMetadata[]>([]);
const events = ref(getLiveTraceEvents());

function sync() {
  instances.value = getRegisteredInstances();
  events.value = getLiveTraceEvents();
}

function buildTree(list: InstanceMetadata[]): LiveTreeNode[] {
  const map = new Map<string, LiveTreeNode>();
  for (const item of list) {
    map.set(item.id, { ...item, children: [] });
  }
  const nextRoots: LiveTreeNode[] = [];
  for (const node of map.values()) {
    const parent = node.parentId ? map.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else nextRoots.push(node);
  }
  return nextRoots;
}

const roots = ref<LiveTreeNode[]>([]);

onMounted(() => {
  const stopA = subscribeInstances(sync);
  const stopB = subscribeLiveTrace(sync);
  sync();
  roots.value = buildTree(instances.value);
  const stopWatch = subscribeInstances(() => {
    roots.value = buildTree(getRegisteredInstances());
  });
  onUnmounted(() => {
    stopA();
    stopB();
    stopWatch();
  });
});
</script>
