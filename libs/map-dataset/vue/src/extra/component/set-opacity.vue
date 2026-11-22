<template>
  <div class="layer-item__opacity">
    <LayerItemSlider
      v-bind="$attrs"
      :model-value="opacityValue"
      @update:modelValue="onUpdateValue"
    />
  </div>
</template>
<script lang="ts" setup>
import type { MapSimple } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  type IListViewUI,
  isHasSetOpacity,
  runAllComponentsWithCheck,
  WithSetOpacity,
} from '@hungpvq/map-dataset';
import { useMap } from '@hungpvq/vue-map-core';
import { ref, watch } from 'vue';

import LayerItemSlider from './layer-item-slider.vue';
import type { WithLayerItemActionType } from './types';

const props = defineProps<WithLayerItemActionType>();
const { callMap } = useMap(props);
const opacityValue = ref(props.data.opacity ?? 1);
function onUpdateValue(opacity: number) {
  opacityValue.value = opacity;
  onSetOpacity(props.data, opacity);
}
function onSetOpacity(view: IListViewUI, opacity: number) {
  const parent = view.getParent() || view;
  callMap((map: MapSimple) => {
    runAllComponentsWithCheck(
      parent,
      (dataset): dataset is IDataset & WithSetOpacity =>
        isHasSetOpacity(dataset),
      [
        (dataset) => {
          dataset.setOpacity(map, opacity);
        },
      ],
    );
  });
}
function updateValue(e: { opacity: number }) {
  const { opacity } = e;
  opacityValue.value = opacity;
}
watch(
  () => props.data,
  (data, _prev, onCleanup) => {
    opacityValue.value = data.opacity ?? 1;
    data.on('changeOpacity', updateValue);
    onCleanup(() => data.off('changeOpacity', updateValue));
  },
  { immediate: true },
);
</script>
