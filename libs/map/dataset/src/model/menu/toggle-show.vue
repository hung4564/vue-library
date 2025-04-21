<template lang="">
  <div v-if="isMulti" class="toggle-buttons-container">
    <button
      class="layer-item__button"
      :class="{ _active: getShow(0) }"
      @click.stop="onToggleShowIndex(0)"
    >
      <span>L</span>
    </button>
    <button
      class="layer-item__button"
      @click.stop="onToggleShowIndex(1)"
      :class="{ _active: getShow(1) }"
    >
      <span>R</span>
    </button>
  </div>
  <button class="layer-item__button" @click.stop="onToggleShow" v-else>
    <SvgIcon size="14" type="mdi" :path="path.show" v-if="data.show" />
    <SvgIcon size="14" type="mdi" :path="path.hide" v-else />
  </button>
</template>
<script setup lang="ts">
import { MapSimple } from '@hungpvq/shared-map';
import { store, store as storeMap, useMap } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import { onMounted, ref } from 'vue';
import {
  IDataset,
  IListViewUI,
  IMapboxLayerView,
  MenuAction,
} from '../../interfaces';
import { isMapboxLayerView } from '../../utils/check';
import { runAllComponentsWithCheck } from '../dataset.visitors';

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
  const show = !props.data.show;
  let item = props.data;
  item.show = !item.show;
  callMap((map: MapSimple) => {
    runAllComponentsWithCheck(
      props.data.getParent() as IDataset,
      (dataset): dataset is IDataset & IMapboxLayerView =>
        isMapboxLayerView(dataset),
      [
        (dataset) => {
          dataset.toggleShow(map, show);
        },
      ]
    );
  });
};
function onToggleShowIndex(index: number) {
  const maps = store.getters.getMaps(mapId.value);
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
    ]
  );
}
const isMulti = ref(false);
onMounted(() => {
  isMulti.value = storeMap.getters.getIsMulti(mapId.value);
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
.toggle-buttons-container {
  display: flex;
  gap: 2px;
}
.toggle-buttons-container span {
  font-size: 0.7rem;
}
</style>
