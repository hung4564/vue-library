<script setup lang="ts">
import { nextTick, onMounted, ref, shallowRef } from 'vue';

import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import {
  ILayerMapView,
  ModuleContainer,
  useLang,
  useMap,
  useShow,
} from '@hungpvq/vue-map-core';
import { getLayerFromView } from '../../helper';

import { MapSimple } from '@hungpvq/shared-map';
import enLang from './lang/style-control.json';
import circleStyleLang from './lang/style/circle-style.json';
import fillStyleLang from './lang/style/fill-style.json';
import lineStyleLang from './lang/style/line-style.json';
import rasterStyleLang from './lang/style/raster-style.json';
import symbolStyleLang from './lang/style/symbol-style.json';
const emit = defineEmits(['close']);
const props = defineProps<{ item: ILayerMapView; option: any }>();
const { mapId, callMap } = useMap();
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault({
  map: { 'style-control': enLang },
  'circle-style': circleStyleLang,
  'line-style': lineStyleLang,
  'fill-style': fillStyleLang,
  'symbol-style': symbolStyleLang,
  'raster-style': rasterStyleLang,
});
const [show, toggleShow] = useShow(false);
const layer = ref();
const layer_map = ref<ILayerMapView | undefined>(undefined);
let layer_map_component: any = shallowRef('');
onMounted(() => {
  toggleShow(true);
  layer_map.value = undefined;
  nextTick(() => {
    const _layer = getLayerFromView(props.item);
    layer_map.value = _layer!.getView('map');
    layer.value = layer_map.value.getValue();
    layer_map_component.value = layer_map.value.getComponentUpdate();
  });
});
const onClose = () => {
  layer_map.value = undefined;
  layer.value = undefined;
  emit('close');
};
const onUpdateStyle = (value: any) => {
  if (!layer_map.value) {
    return;
  }
  callMap((map: MapSimple) => {
    if (!layer_map.value) {
      return;
    }
    layer_map.value.updateValue(map, value);
    layer.value = layer_map.value.getValue();
  });
};
</script>
<template>
  <ModuleContainer v-bind="$attrs">
    <template #draggable="props">
      <DraggableItemSideBar
        v-bind="props"
        right
        v-model:show="show"
        v-if="layer_map_component"
        @close="onClose"
      >
        <template #title>
          <span class="layer-control__title">
            {{ trans('map.style-control.title') }}
          </span>
        </template>
        <div class="style-control">
          <component
            :is="layer_map_component()"
            v-model="layer"
            @update-style="onUpdateStyle"
            :trans="trans"
            :mapId="mapId"
          />
        </div>
      </DraggableItemSideBar>
    </template>
  </ModuleContainer>
</template>
<style lang="scss">
.style-control {
  .vc-sketch {
    width: calc(100% - 20px);
    background-color: transparent;
    box-shadow: unset;
    .vc-input__label {
      color: #fff;
    }
  }
  height: 100%;
  overflow: hidden;
}
</style>
