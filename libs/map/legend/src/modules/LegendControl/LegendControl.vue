<script setup lang="ts">
import { MapSimple } from '@hungpvq/shared-map';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  InputCheckbox,
  MapControlButton,
  ModuleContainer,
  useEventListener,
  useLang,
  useMap,
  useShow,
  withMapProps,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiMapLegend } from '@mdi/js';
import { ref, shallowRef, watch } from 'vue';
import { getLegendName, isSupportGenLayerLegend } from '../../check';
import { useLayerLegend } from '../../lib/useLayerLegend';
const props = defineProps({
  ...withMapProps,
});
const [show, setShow] = useShow(false);
const { callMap, mapId, moduleContainerProps } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
const { getLayerLegendVNode } = useLayerLegend();

setLocaleDefault({
  map: {
    'legend-control': {
      title: 'Legend',
      onlyRendered: 'Only rendered',
    },
  },
});
function onToggleShow() {
  setShow(!show.value);
}
const onlyRender = ref(false);
const legends = shallowRef<{ icon: any; name: string }[]>([]);
function updateLegend(map: MapSimple) {
  let layers = map?.getStyle().layers;
  let visibleLayers: Set<string> | null = null;
  if (onlyRender.value) {
    visibleLayers = new Set(); // Dùng Set để tránh trùng lặp

    // Lấy các feature đang render trong viewport
    const features = map.queryRenderedFeatures();
    for (const feature of features) {
      visibleLayers.add(feature.layer.id);
    }
  }
  legends.value = layers
    .slice()
    .reverse()
    .filter(
      (layer) =>
        (!visibleLayers || (visibleLayers && visibleLayers.has(layer.id))) &&
        isSupportGenLayerLegend(layer),
    )
    .map((layer) => ({
      icon: getLayerLegendVNode(map, layer as any),
      name: getLegendName(layer as any),
    }));
}
useEventListener(mapId.value, 'styledata', updateLegend);
const { add, remove } = useEventListener(
  mapId.value,
  'moveend',
  updateLegend,
  false,
);
watch(onlyRender, (newValue) => {
  if (newValue) {
    add();
    callMap((map) => {
      updateLegend(map);
    });
  } else {
    remove();
  }
});
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        @click.stop="onToggleShow()"
        :tooltip="trans('map.legend-control.title')"
      >
        <SvgIcon :size="18" type="mdi" :path="mdiMapLegend" />
      </MapControlButton>
    </template>

    <template #draggable="props">
      <DraggableItemPopup
        v-if="show"
        :height="400"
        :width="400"
        v-bind="props"
        v-model:show="show"
        :title="trans('map.legend-control.title')"
      >
        <div class="legend-control-container">
          <div class="legend-control">
            <div
              v-for="(legendVNode, index) in legends"
              :key="index"
              class="legend-control-item"
            >
              <div class="legend-control-item__icon">
                <component :is="legendVNode.icon" />
              </div>
              <span>{{ legendVNode.name }}</span>
            </div>
          </div>
          <div class="legend-action">
            <InputCheckbox
              :label="trans('map.legend-control.onlyRendered')"
              v-model="onlyRender"
            />
          </div>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
<style></style>

<style scoped>
.legend-control {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;
  overflow: auto;
}
.legend-control-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.legend-control-item__icon {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}
:deep(.legend-item-container) {
  width: 17px;
  height: 17px;
}
:deep(.legend-item) {
  width: 17px;
  height: 17px;
}
.legend-control-container {
  padding: 8px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.legend-action {
  flex: 0 0 auto;
  padding: 8px;
}
</style>
