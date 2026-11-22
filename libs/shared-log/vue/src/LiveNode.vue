<script setup lang="ts">
import { computed, ref } from 'vue';
import type { LiveTreeNode } from './live-tree';

defineOptions({ name: 'LiveNode' });

const props = withDefaults(
  defineProps<{
    node: LiveTreeNode;
    depth?: number;
    selectedId?: string | null;
    instanceRenders?: Record<string, number>;
    instanceEvents?: Record<string, number>;
  }>(),
  {
    depth: 0,
    selectedId: null,
    instanceRenders: () => ({}),
    instanceEvents: () => ({}),
  },
);

const emit = defineEmits<{
  select: [id: string];
}>();

const expanded = ref(true);
const depthVal = computed(() => props.depth ?? 0);
const hasChildren = computed(() => props.node.children.length > 0);

function toggleExpand(event: MouseEvent) {
  event.stopPropagation();
  expanded.value = !expanded.value;
}

function onSelect() {
  emit('select', props.selectedId === props.node.id ? '' : props.node.id);
}
</script>

<template>
  <div
    class="live-viewer__node"
    :class="{
      'live-viewer__node--open': expanded && hasChildren,
      'live-viewer__node--has-children': hasChildren,
    }"
    :style="{ '--tree-depth': String(depthVal) }"
  >
    <div
      class="live-viewer__node-row"
      :class="{ 'live-viewer__node-row--selected': selectedId === node.id }"
      role="button"
      tabindex="0"
      @click="onSelect"
      @keydown.enter.prevent="onSelect"
      @keydown.space.prevent="onSelect"
    >
      <button
        v-if="hasChildren"
        type="button"
        class="live-viewer__twist"
        :title="expanded ? 'Collapse' : 'Expand'"
        @click.stop="toggleExpand"
      >
        {{ expanded ? '▾' : '▸' }}
      </button>
      <span
        v-else
        class="live-viewer__twist live-viewer__twist--empty"
        aria-hidden="true"
      />
      <span class="live-viewer__rail">
        <span class="live-viewer__dot" />
      </span>
      <span class="live-viewer__card">
        <span class="live-viewer__node-name">{{ node.component }}</span>
        <span class="live-viewer__node-id">({{ node.id }})</span>
      </span>
      <span
        v-if="instanceRenders?.[node.id] || instanceEvents?.[node.id]"
        class="live-viewer__node-badges"
      >
        <span
          v-if="instanceRenders?.[node.id]"
          class="live-viewer__node-count"
          title="Render Count"
        >
          #{{ instanceRenders[node.id] }}
        </span>
        <span
          v-if="instanceEvents?.[node.id]"
          class="live-viewer__node-count"
          title="Total Events"
        >
          {{ instanceEvents[node.id] }}ev
        </span>
      </span>
    </div>
    <div
      v-if="expanded && hasChildren"
      class="live-viewer__node-children"
    >
      <LiveNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depthVal + 1"
        :selected-id="selectedId"
        :instance-renders="instanceRenders"
        :instance-events="instanceEvents"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>
