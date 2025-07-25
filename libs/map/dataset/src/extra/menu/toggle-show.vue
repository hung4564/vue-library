<template lang="">
  <div v-if="isMulti" class="toggle-buttons-container">
    <BaseButton
      :class="{ _active: getShow(0) }"
      @click.stop="onToggleShowIndex(0)"
    >
      <span>#1</span>
    </BaseButton>
    <BaseButton
      @click.stop="onToggleShowIndex(1)"
      :class="{ _active: getShow(1) }"
    >
      <span>#2</span>
    </BaseButton>
  </div>
  <BaseButton @click.stop="onToggleShow" v-else>
    <SvgIcon size="14" type="mdi" :path="path.show" v-if="data.show" />
    <SvgIcon size="14" type="mdi" :path="path.hide" v-else />
  </BaseButton>
</template>
<script setup lang="ts">
import { MapSimple } from '@hungpvq/shared-map';
import { BaseButton, getIsMulti, getMaps, useMap } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import { onMounted, ref } from 'vue';
import { IDataset, IMapboxLayerView, MenuAction } from '../../interfaces';
import type { WithToggleShow } from '../../interfaces/dataset.extra';
import { IListViewUI } from '../../model';
import { runAllComponentsWithCheck } from '../../model/visitors';
import { isHasToggleShow, isMapboxLayerView } from '../../utils/check';

const path = {
  show: mdiEye,
  hide: mdiEyeOff,
};
const props = defineProps<{
  item: MenuAction<IListViewUI>;
  data: IListViewUI;
  mapId: string;
}>();
const { callMap, mapId } = useMap(props);
const onToggleShow = () => {
  let item = props.data;
  const show = !item.show;
  item.show = show;
  callMap((map: MapSimple) => {
    runAllComponentsWithCheck<IDataset & WithToggleShow>(
      props.data.getParent() as IDataset,
      (dataset) => isHasToggleShow(dataset),
      [
        (dataset) => {
          dataset.toggleShow(map, show);
        },
      ],
    );
  });
};
function onToggleShowIndex(index: number) {
  const maps = getMaps(mapId.value);
  const map = maps[index];
  const show = getShow(index);
  let item = props.data;
  item.shows[index] = !show;
  runAllComponentsWithCheck(
    props.data.getParent() as IDataset,
    (dataset): dataset is IDataset & IMapboxLayerView =>
      isMapboxLayerView(dataset),
    [
      (dataset) => {
        dataset.toggleShow(map, item.shows[index]);
      },
    ],
  );
}
const isMulti = ref(false);
onMounted(() => {
  isMulti.value = getIsMulti(mapId.value);
});
function getShow(index: number) {
  let item = props.data;
  if (props.data.shows == null || props.data.shows.length < 1) {
    const show = props.data.show == null ? true : props.data.show;
    item.shows = [show, show];
  }
  return props.data.shows[index];
}
</script>
<style>
._active {
  position: relative;
}
._active::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--v-primary-base, #1a73e8);
  opacity: 0.5;
  z-index: -1;
}
.toggle-buttons-container span {
  font-size: 0.7rem;
}
</style>
