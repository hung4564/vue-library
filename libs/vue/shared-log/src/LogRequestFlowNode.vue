<script lang="ts">
export default { name: 'log-request-flow-node' };
</script>
<script setup lang="ts">
import {
  formatFlowDelta,
  formatLogTime,
  type RequestFlowTreeNode,
} from '@hungpvq/shared-log';
import { computed, ref } from 'vue';

import LogRequestFlowNode from './LogRequestFlowNode.vue';

const props = defineProps<{
  node: RequestFlowTreeNode;
  activeLogId?: string | null;
  depth?: number;
  flat?: boolean;
}>();

const emit = defineEmits<{
  select: [logId: string];
}>();

const expanded = ref(true);
const depthVal = computed(() => props.depth ?? 0);
const isFrame = computed(() => !props.flat && props.node.phase === 'START');

const frameParts = computed(() => {
  if (!isFrame.value) {
    return {
      body: props.node.children,
      closers: [] as RequestFlowTreeNode[],
      after: [] as RequestFlowTreeNode[],
    };
  }
  const body: RequestFlowTreeNode[] = [];
  const closers: RequestFlowTreeNode[] = [];
  const after: RequestFlowTreeNode[] = [];
  let closed = false;
  for (const child of props.node.children) {
    if (!closed && (child.phase === 'END' || child.phase === 'ERROR')) {
      closers.push(child);
      closed = true;
    } else if (closed) {
      after.push(child);
    } else {
      body.push(child);
    }
  }
  return { body, closers, after };
});

const canToggle = computed(
  () =>
    frameParts.value.body.length > 0 ||
    (!isFrame.value && props.node.children.length > 0),
);

function phaseClass(node: RequestFlowTreeNode) {
  return {
    'log-request-flow__step--active': props.activeLogId === node.id,
    'log-request-flow__step--emit': node.phase === 'EMIT',
    'log-request-flow__step--handler': node.flowKind === 'handler',
    'log-request-flow__step--start': node.phase === 'START',
    'log-request-flow__step--end': node.phase === 'END',
    'log-request-flow__step--error-phase': node.phase === 'ERROR',
  };
}

function toggleExpand(event: MouseEvent) {
  event.stopPropagation();
  expanded.value = !expanded.value;
}
</script>

<template>
  <li
    class="log-request-flow__item"
    :class="{
      'log-request-flow__frame': isFrame,
      'log-request-flow__frame--open':
        isFrame && expanded && frameParts.body.length > 0,
    }"
    :style="{ '--flow-depth': String(depthVal) }"
  >
    <div
      class="log-request-flow__step"
      :class="[`log-request-flow__step--${node.level}`, phaseClass(node)]"
      role="button"
      tabindex="0"
      @click="emit('select', node.id)"
    >
      <button
        v-if="canToggle"
        type="button"
        class="log-request-flow__twist"
        @click="toggleExpand"
      >
        {{ expanded ? '▾' : '▸' }}
      </button>
      <span
        v-else
        class="log-request-flow__twist log-request-flow__twist--empty"
      />
      <span class="log-request-flow__delta">{{
        formatFlowDelta(node.deltaMs)
      }}</span>
      <span class="log-request-flow__card">
        <span class="log-request-flow__label">{{ node.label }}</span>
        <span class="log-request-flow__sub">
          {{ formatLogTime(node.ts) }}
          <template v-if="node.fn"> · {{ node.fn }}</template>
        </span>
      </span>
    </div>
    <ol
      v-if="isFrame && expanded && frameParts.body.length > 0"
      class="log-request-flow__children"
    >
      <LogRequestFlowNode
        v-for="child in frameParts.body"
        :key="child.id"
        :node="child"
        :depth="depthVal + 1"
        :flat="flat"
        :active-log-id="activeLogId"
        @select="emit('select', $event)"
      />
    </ol>
    <ol
      v-if="!isFrame && canToggle && expanded"
      class="log-request-flow__children"
    >
      <LogRequestFlowNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depthVal + 1"
        :flat="flat"
        :active-log-id="activeLogId"
        @select="emit('select', $event)"
      />
    </ol>
  </li>
</template>
