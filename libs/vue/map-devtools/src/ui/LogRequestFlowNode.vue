<script lang="ts">
export default { name: 'log-request-flow-node' };
</script>
<script setup lang="ts">
import {
  formatFlowDelta,
  formatLogTime,
  type RequestFlowTreeNode,
} from '@hungpvq/map-debug';
import { computed, ref } from 'vue';
import LogRequestFlowNode from './LogRequestFlowNode.vue';

const props = defineProps<{
  node: RequestFlowTreeNode;
  activeLogId?: string | null;
  /** Indent depth for flat/tree visual (0 = root). */
  depth?: number;
  /** Flat mode: no START/END frame rail. */
  flat?: boolean;
}>();

const emit = defineEmits<{
  select: [logId: string];
}>();

const expanded = ref(true);
const depthVal = computed(() => props.depth ?? 0);

const isFrame = computed(
  () => !props.flat && props.node.phase === 'START',
);

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
      'log-request-flow__frame--has-end':
        isFrame && frameParts.closers.length > 0,
    }"
    :style="{ '--flow-depth': String(depthVal) }"
  >
    <div
      class="log-request-flow__step"
      :class="[`log-request-flow__step--${node.level}`, phaseClass(node)]"
      role="button"
      tabindex="0"
      @click="emit('select', node.id)"
      @keydown.enter.prevent="emit('select', node.id)"
    >
      <button
        v-if="canToggle"
        type="button"
        class="log-request-flow__twist"
        :aria-expanded="expanded"
        :title="expanded ? 'Collapse' : 'Expand'"
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
      <span class="log-request-flow__rail" aria-hidden="true">
        <span class="log-request-flow__dot" />
      </span>
      <span class="log-request-flow__card">
        <span class="log-request-flow__title">
          <span class="log-request-flow__label">{{ node.label }}</span>
          <span
            v-if="node.phase && node.phase !== 'mid'"
            class="log-request-flow__kind"
            >{{ node.phase }}</span
          >
          <span v-else-if="node.flowKind" class="log-request-flow__kind">{{
            node.flowKind
          }}</span>
        </span>
        <span class="log-request-flow__sub">
          <template v-if="node.index != null">#{{ node.index }} · </template>
          {{ formatLogTime(node.ts) }}
          <template v-if="node.namespace"> · {{ node.namespace }}</template>
          <template v-if="node.fn && node.phase === 'mid'">
            · {{ node.fn }}</template
          >
          <template v-if="node.span"> · {{ node.span }}</template>
        </span>
      </span>
    </div>

    <!-- Frame body: indented between START and END, with vertical rail -->
    <div
      v-if="isFrame && expanded && frameParts.body.length > 0"
      class="log-request-flow__frame-body"
    >
      <ol class="log-request-flow__children">
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
    </div>

    <!-- END / ERROR: same column as START (visible even when collapsed) -->
    <template v-if="isFrame">
      <div
        v-for="closer in frameParts.closers"
        :key="closer.id"
        class="log-request-flow__step"
        :class="[
          `log-request-flow__step--${closer.level}`,
          phaseClass(closer),
        ]"
        role="button"
        tabindex="0"
        @click="emit('select', closer.id)"
        @keydown.enter.prevent="emit('select', closer.id)"
      >
        <span class="log-request-flow__twist log-request-flow__twist--empty" />
        <span class="log-request-flow__delta">{{
          formatFlowDelta(closer.deltaMs)
        }}</span>
        <span class="log-request-flow__rail" aria-hidden="true">
          <span class="log-request-flow__dot" />
        </span>
        <span class="log-request-flow__card">
          <span class="log-request-flow__title">
            <span class="log-request-flow__label">{{ closer.label }}</span>
            <span
              v-if="closer.phase && closer.phase !== 'mid'"
              class="log-request-flow__kind"
              >{{ closer.phase }}</span
            >
          </span>
          <span class="log-request-flow__sub">
            <template v-if="closer.index != null"
              >#{{ closer.index }} · </template
            >
            {{ formatLogTime(closer.ts) }}
            <template v-if="closer.namespace">
              · {{ closer.namespace }}</template
            >
            <template v-if="closer.span"> · {{ closer.span }}</template>
          </span>
        </span>
      </div>
      <ol
        v-if="expanded && frameParts.after.length > 0"
        class="log-request-flow__children log-request-flow__children--after"
      >
        <LogRequestFlowNode
          v-for="child in frameParts.after"
          :key="child.id"
          :node="child"
          :depth="depthVal"
          :flat="flat"
          :active-log-id="activeLogId"
          @select="emit('select', $event)"
        />
      </ol>
    </template>

    <!-- Non-frame nesting -->
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
