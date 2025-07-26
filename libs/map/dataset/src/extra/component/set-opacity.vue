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
import type { MapSimple } from '@hungpvq/shared-map';
import { useMap } from '@hungpvq/vue-map-core';
import { onMounted, onUnmounted, ref } from 'vue';
import type { IDataset } from '../../interfaces';
import { WithSetOpacity } from '../../interfaces/dataset.extra';
import { runAllComponentsWithCheck, type IListViewUI } from '../../model';
import { isHasSetOpacity } from '../../utils/check';
import LayerItemSlider from './layer-item-slider.vue';
import { WithLayerItemActionType } from './types';

const props = defineProps<WithLayerItemActionType>();
const { callMap } = useMap(props);
const opacityValue = ref(props.data.opacity);
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
onMounted(() => {
  props.data.on('changeOpacity', updateValue);
});
onUnmounted(() => {
  props.data.off('changeOpacity', updateValue);
});
</script>

<style scoped>
.layer-item__opacity {
  flex: 1 1 auto;
  max-width: 50%;
}
</style>
