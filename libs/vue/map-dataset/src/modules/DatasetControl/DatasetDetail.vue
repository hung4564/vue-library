<script lang="ts">
export default {
  name: 'detail-dataset-info',
};
</script>

<script setup lang="ts">
import type { IDataset } from '@hungpvq/map-dataset';
import { traverseTree } from '@hungpvq/map-dataset';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  ModuleContainer,
  useMap,
  useRegisterMapControl,
} from '@hungpvq/vue-map-core';
import { ref, shallowRef, watch } from 'vue';
const props = defineProps<{ dataset: IDataset }>();
const emit = defineEmits(['close']);
const { mapId } = useMap();
const show = ref(true);
function onUpdateShow(val: boolean) {
  show.value = val;
  if (!val) {
    emit('close');
  }
}
const { panelBind } = useRegisterMapControl(mapId, {
  id: 'mapDatasetDetail',
  panelKind: 'popup',
  title: () => props.dataset?.getName?.(),
  show,
  setShow: (value) => {
    show.value = value;
    if (!value) emit('close');
  },
  actions: [
    {
      type: 'mapDatasetDetail',
      run: () => {
        show.value = !show.value;
        if (!show.value) emit('close');
      },
    },
  ],
});
const items = shallowRef<{ level: number; path: number[]; node: IDataset }[]>(
  [],
);
watch(
  () => props.dataset,
  (newVal) => {
    items.value = [];
    traverseTree(newVal, (node, level, path) => {
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
    <template #draggable="slotProps">
      <DraggableItemPopup
        v-bind="{ ...slotProps, ...panelBind }"
        :show="show"
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
