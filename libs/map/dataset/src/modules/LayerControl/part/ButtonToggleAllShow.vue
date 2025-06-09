<template lang="">
  <div v-if="isMulti" class="toggle-buttons-container">
    <BaseButton
      :class="{ _active: allLayerMultiShow[0] }"
      @click.stop="onToggleShowIndex(0, !allLayerMultiShow[0])"
    >
      <span>#1</span>
    </BaseButton>
    <BaseButton
      @click.stop="onToggleShowIndex(1, !allLayerMultiShow[1])"
      :class="{ _active: allLayerMultiShow[1] }"
    >
      <span>#2</span>
    </BaseButton>
  </div>
  <BaseButton
    @click.stop="onToggleShow(!allLayerShow)"
    v-else
    :title="!allLayerShow ? 'Ẩn toàn bộ các lớp' : 'Hiện toàn bộ các lớp'"
  >
    <SvgIcon size="16" type="mdi" :path="!allLayerShow ? mdiEye : mdiEyeOff" />
  </BaseButton>
</template>
<script setup lang="ts">
import type { MapSimple } from '@hungpvq/shared-map';
import { BaseButton, getIsMulti, getMaps, useMap } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import { onMounted, ref } from 'vue';
import type {
  IDataset,
  IListViewUI,
  IMapboxLayerView,
} from '../../../interfaces';
import { runAllComponentsWithCheck } from '../../../model';
import { isMapboxLayerView } from '../../../utils/check';

const allLayerShow = ref(true);
const allLayerMultiShow = ref([true, true]);
defineExpose({
  SvgIcon,
});
const props = defineProps<{
  items: IListViewUI[];
}>();
const { callMap, mapId } = useMap(props);
const onToggleShow = (value: boolean) => {
  allLayerShow.value = value;
  const show = allLayerShow.value;
  callMap((map: MapSimple) => {
    props.items.forEach((item) => {
      item.show = show;
      runAllComponentsWithCheck(
        item.getParent() as IDataset,
        (dataset): dataset is IDataset & IMapboxLayerView =>
          isMapboxLayerView(dataset),
        [
          (dataset) => {
            dataset.toggleShow(map, show);
          },
        ],
      );
    });
  });
};
function onToggleShowIndex(index: number, show: boolean) {
  allLayerMultiShow.value[index] = show;
  const maps = getMaps(mapId.value);
  const map = maps[index];
  props.items.forEach((item) => {
    if (item.shows == null) {
      item.shows = [true, true];
    }
    item.shows[index] = show;
    runAllComponentsWithCheck(
      item.getParent() as IDataset,
      (dataset): dataset is IDataset & IMapboxLayerView =>
        isMapboxLayerView(dataset),
      [
        (dataset) => {
          dataset.toggleShow(map, show);
        },
      ],
    );
  });
}
const isMulti = ref(false);
onMounted(() => {
  isMulti.value = getIsMulti(mapId.value);
});
</script>
