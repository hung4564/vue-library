<script setup lang="ts">
import { onMounted, Ref, ref, shallowRef } from 'vue';

import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import {
  ModuleContainer,
  useLang,
  useMap,
  useShow,
} from '@hungpvq/vue-map-core';

import { copyByJson } from '@hungpvq/shared';
import { MapSimple } from '@hungpvq/shared-map';
import { IDataset, IMapboxLayerView } from '../../interfaces';
import { findSiblingOrNearestLeaf } from '../../model';
import { useUniversalRegistry } from '../../registry';
import { ComponentType } from '../../types';
import { isMapboxLayerView } from '../../utils/check';
import enLang from './lang/style-control.json';
import circleStyleLang from './lang/style/circle-style.json';
import fillStyleLang from './lang/style/fill-style.json';
import lineStyleLang from './lang/style/line-style.json';
import rasterStyleLang from './lang/style/raster-style.json';
import symbolStyleLang from './lang/style/symbol-style.json';
const emit = defineEmits(['close']);
const props = defineProps<{ item: IDataset }>();
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
const layer_map = ref<IMapboxLayerView | undefined>(undefined);
let layer_map_component: Ref<ComponentType> = shallowRef({
  componentKey: '',
});
onMounted(() => {
  toggleShow(true);
  layer_map.value = undefined;
  updateValue();
});
const onClose = () => {
  layer_map.value = undefined;
  layer.value = undefined;
  emit('close');
};
const onUpdateStyle = (value: any) => {
  callMap((map: MapSimple) => {
    if (!layer_map.value) {
      return;
    }
    layer_map.value.updateValue(map, value);
  });
  updateValue();
};
const updateValue = () => {
  const layerView = findSiblingOrNearestLeaf(props.item, (dataset) =>
    isMapboxLayerView(dataset),
  );
  if (layerView) {
    if (isMapboxLayerView(layerView)) {
      layer_map.value = layerView || undefined;
      layer_map_component.value = layerView.getComponentUpdate();
      layer.value = copyByJson(layerView.getData());
    }
  }
};
const { getComponent } = useUniversalRegistry(mapId.value);
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
        :title="trans('map.style-control.title')"
      >
        <template #title>
          <span class="layer-control__title">
            {{ trans('map.style-control.title') }}
          </span>
        </template>
        <div class="style-control">
          <component
            :is="getComponent(layer_map_component.componentKey)"
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
