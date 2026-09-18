<template>
  <div class="dataset-tree-nav" role="tree" :aria-label="ariaLabel">
    <DatasetTreeNavNode
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :selected-id="selectedId"
      :highlighted-ids="highlightedIds"
      :depth="0"
      :force-expand-ids="forceExpandIds"
      @select="$emit('select', $event)"
    />
    <p v-if="!nodes.length" class="dataset-tree-nav__empty">No datasets</p>
  </div>
</template>

<script setup lang="ts">
import type { DatasetTreeNode } from '@hungpvq/map-debug/dataset';
import DatasetTreeNavNode from './DatasetTreeNavNode.vue';

withDefaults(
  defineProps<{
    nodes: DatasetTreeNode[];
    selectedId?: string;
    highlightedIds?: string[];
    forceExpandIds?: string[];
    ariaLabel?: string;
  }>(),
  {
    highlightedIds: () => [],
    forceExpandIds: () => [],
  },
);

defineEmits<{
  select: [id: string];
}>();
</script>
