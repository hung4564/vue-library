<template>
  <div
    class="dataset-tree-nav-node"
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
      :style="{ paddingLeft: `${8 + depth * 12}px` }"
    >
      <MapControlButton
        v-if="hasChildren"
        variant="text"
        size="small"
        class="dataset-tree-nav-node__toggle"
        :aria-label="open ? 'Collapse' : 'Expand'"
        @click.stop="open = !open"
      >
        {{ open ? '▾' : '▸' }}
      </MapControlButton>
      <span
        v-else
        class="dataset-tree-nav-node__toggle is-leaf"
        aria-hidden="true"
        >·</span
      >
      <MapControlButton
        variant="text"
        size="small"
        class="dataset-tree-nav-node__select"
        :active="selected"
        :title="`${node.name} (${node.type}) · ${node.id}`"
        @click="$emit('select', node.id)"
      >
        <span class="dataset-tree-nav-node__kind">{{ kindLabel }}</span>
        <span class="dataset-tree-nav-node__name">{{ node.name }}</span>
        <span class="dataset-tree-nav-node__type">{{ node.type }}</span>
      </MapControlButton>
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
import { MapControlButton } from '@hungpvq/vue-map-core';
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
