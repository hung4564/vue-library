<template>
  <div
    class="dataset-tree-nav-node"
    :class="{ 'is-open': open && hasChildren, 'has-children': hasChildren }"
    :style="{ '--tree-depth': String(depth) }"
    role="treeitem"
    :aria-expanded="hasChildren ? open : undefined"
    :aria-selected="selected"
  >
    <div
      class="dataset-tree-nav-node__row"
      :class="{
        'is-selected': selected,
        'is-highlighted': highlighted,
        [`is-kind-${kind}`]: true,
      }"
      :data-dataset-id="node.id"
      tabindex="0"
      @click="$emit('select', node.id)"
      @keydown.enter.prevent="$emit('select', node.id)"
      @keydown.space.prevent="$emit('select', node.id)"
    >
      <button
        v-if="hasChildren"
        type="button"
        class="dataset-tree-nav-node__twist"
        :aria-label="open ? 'Collapse' : 'Expand'"
        @click.stop="open = !open"
      >
        {{ open ? '▾' : '▸' }}
      </button>
      <span
        v-else
        class="dataset-tree-nav-node__twist dataset-tree-nav-node__twist--empty"
        aria-hidden="true"
      />
      <span class="dataset-tree-nav-node__rail">
        <span class="dataset-tree-nav-node__dot" />
      </span>
      <span
        class="dataset-tree-nav-node__card"
        :title="`${node.name} (${node.type}) · ${node.id}`"
      >
        <span class="dataset-tree-nav-node__kind">{{ kindLabel }}</span>
        <span class="dataset-tree-nav-node__name">{{ node.name }}</span>
        <span class="dataset-tree-nav-node__type">{{ node.type }}</span>
      </span>
    </div>
    <div
      v-if="hasChildren && open"
      class="dataset-tree-nav-node__children"
      role="group"
    >
      <DatasetTreeNavNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected-id="selectedId"
        :highlighted-ids="highlightedIds"
        :depth="depth + 1"
        :force-expand-ids="forceExpandIds"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DatasetTreeNode } from '@hungpvq/map-debug/dataset';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  node: DatasetTreeNode;
  selectedId?: string;
  highlightedIds?: string[];
  depth: number;
  forceExpandIds?: string[];
}>();

defineEmits<{
  select: [id: string];
}>();

const hasChildren = computed(() => (props.node.children?.length ?? 0) > 0);
const selected = computed(() => props.selectedId === props.node.id);
const highlighted = computed(() =>
  (props.highlightedIds ?? []).includes(props.node.id),
);
const kind = computed(() => {
  if (props.depth === 0) return 'root';
  if (hasChildren.value) return 'group';
  return 'leaf';
});
const kindLabel = computed(() => {
  if (kind.value === 'root') return 'R';
  if (kind.value === 'group') return 'G';
  return 'L';
});

const open = ref(props.depth < 1);

watch(
  () => props.forceExpandIds,
  (ids) => {
    if (ids?.includes(props.node.id)) open.value = true;
  },
  { immediate: true },
);
</script>
