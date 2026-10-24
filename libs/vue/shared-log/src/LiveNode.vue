<script setup lang="ts">
import type { LiveTreeNode } from './live-tree';

defineOptions({ name: 'LiveNode' });
defineProps<{ node: LiveTreeNode }>();
</script>

<template>
  <div class="live-viewer__node">
    <div class="live-viewer__node-label">
      {{ node.component }} ({{ node.id }})
    </div>
    <LiveNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
    />
  </div>
</template>
