<script lang="ts">
export default {
  name: 'detail-dataset-info',
};
</script>

<script setup lang="ts">
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import { ModuleContainer } from '@hungpvq/vue-map-core';
import { shallowRef, watch } from 'vue';
import type { IDataset } from '../../interfaces';
import { traverseTree } from '../../model';
const props = defineProps<{ dataset: IDataset }>();
const emit = defineEmits(['close']);
function onUpdateShow(val: boolean) {
  if (!val) {
    emit('close');
  }
}
const items = shallowRef<{ level: number; path: number[]; node: IDataset }[]>(
  [],
);
watch(
  () => props.dataset,
  (newVal) => {
    traverseTree(props.dataset, (node, level, path) => {
      items.value.push({
        node,
        level,
        path,
      });
    });
  },
  { immediate: true },
);
</script>
<template>
  <ModuleContainer v-bind="$attrs">
    <template #draggable="props">
      <DraggableItemPopup
        v-bind="props"
        show
        @update:show="onUpdateShow"
        :width="400"
        :height="400"
      >
        <template #title>
          {{ dataset.getName() }}
        </template>
        <ul class="dataset-list">
          <li
            v-for="(item, index) in items"
            :key="index"
            class="dataset-list-item"
            :style="{ paddingLeft: `${item.level * 0.5}rem` }"
          >
            <span>{{ item.path.join('.') }}</span>
            <span>({{ item.node.type }})</span>
            <span>{{ item.node.getName() }}</span>
          </li>
        </ul>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
<style scoped>
.dataset-list-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  gap: 8px;
}
.dataset-list {
  padding: 8px;
}
</style>
