<template>
  <SvgIcon
    size="14"
    type="mdi"
    :path="isShow ? path.legendClose : path.legendOpen"
  />
  <LayerItemBottom :item="item" v-if="isShow"> test </LayerItemBottom>
</template>
<script lang="ts" setup>
import { IListView } from '@hungpvq/vue-map-core';
import {
  getLayerData,
  getLayerFromView,
  LayerItemBottom,
} from '@hungpvq/vue-map-layer';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiMenuDown, mdiMenuLeft } from '@mdi/js';
import { computed } from 'vue';

const props = defineProps<{ item: IListView; mapId: string }>();
const layer = getLayerFromView(props.item)!;
const data = getLayerData<{ is_show: boolean }>(props.mapId, layer.id);
const path = {
  legendOpen: mdiMenuLeft,
  legendClose: mdiMenuDown,
};
const isShow = computed(() => {
  return data.value.is_show;
});
</script>
