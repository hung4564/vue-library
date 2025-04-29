<script setup lang="ts">
import { MapSimple } from '@hungpvq/shared-map';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
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
import { shallowRef } from 'vue';
import {
  getLegendName,
  isDisabledLegendLayer,
  isSupportGenLayerLegend,
} from '../../check';
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
    },
  },
});
function onToggleShow() {
  setShow(!show.value);
}
const legends = shallowRef<{ icon: any; name: string }[]>([]);
function updateLegend(map: MapSimple) {
  let layers = map?.getStyle().layers;
  legends.value = layers
    .slice()
    .reverse()
    .filter((layer) => isSupportGenLayerLegend(layer))
    .map((layer) => ({
      icon: getLayerLegendVNode(map, layer as any),
      name: getLegendName(layer),
    }));
}
useEventListener(mapId.value, 'styledata', updateLegend);
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
::v-deep .legend-item-container {
  width: 17px;
  height: 17px;
}
::v-deep .legend-item {
  width: 17px;
  height: 17px;
}
</style>
