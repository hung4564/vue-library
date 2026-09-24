<script setup lang="ts">
import type { MapSimple, WithMapPropType } from '@hungpvq/map-core';
import {
  getLegendName,
  isSupportGenLayerLegend,
} from '@hungpvq/map-core/legend';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import { mdiMapLegend } from '@mdi/js';
import { ref, shallowRef, watch } from 'vue';

import MapCommonButton from '../../../components/MapCommonButton.vue';
import { InputCheckbox } from '../../../field';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { useShow } from '../../../hooks/useShow';
import ModuleContainer from '../../../modules/ModuleContainer/ModuleContainer.vue';
import { useEventListener } from '../../event/hook/useEvent';
import { useLang } from '../../lang/hook';
import { useRegisterMapControl } from '../../registry/useRegisterMapControl';
import { useToolbarControl } from '../../toolbar/helper';
import { useLayerLegend } from '../lib/useLayerLegend';
const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const [show, setShow] = useShow(false);
const { callMap, mapId, moduleContainerProps, order } = useMap(props);
const { trans } = useLang(mapId.value);
const { getLayerLegendVNode } = useLayerLegend();

function onToggleShow() {
  setShow(!show.value);
}
const { panelBind } = useRegisterMapControl(mapId, {
  id: 'mapLegendControl',
  panelKind: 'popup',
  title: () => trans.value('map.legend-control.title'),
  buttonPosition: () => props.position,
  show,
  setShow,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: 'mapLegendControl',
      run: () => onToggleShow(),
    },
  ],
});
const onlyRender = ref(false);
const legends = shallowRef<{ icon: any; name: string }[]>([]);
function updateLegend(map: MapSimple) {
  if (!map) return;
  let layers: ReturnType<MapSimple['getStyle']>['layers'] = [];
  try {
    layers = map.getStyle()?.layers || [];
  } catch {
    return;
  }
  let visibleLayers: Set<string> | null = null;
  if (onlyRender.value) {
    visibleLayers = new Set();
    try {
      for (const feature of map.queryRenderedFeatures()) {
        visibleLayers.add(feature.layer.id);
      }
    } catch {
      visibleLayers = null;
    }
  }
  legends.value = layers
    .slice()
    .reverse()
    .filter(
      (layer) =>
        (!visibleLayers || visibleLayers.has(layer.id)) &&
        isSupportGenLayerLegend(layer),
    )
    .map((layer) => {
      try {
        return {
          icon: getLayerLegendVNode(map, layer as any),
          name: getLegendName(layer as any),
        };
      } catch {
        return { icon: null, name: getLegendName(layer as any) };
      }
    });
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
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapLegendControl',
  getState() {
    return mdiButtonState(mdiMapLegend, {
      visible: true,
      active: show.value,
      title: trans.value('map.legend-control.title'),
      order: order.value,
    });
  },
  onClick() {
    onToggleShow();
  },
});
watch(show, () => control.sync());
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      >
      </MapCommonButton>
    </template>

    <template #draggable="slotProps">
      <DraggableItemPopup
        v-if="show"
        :height="400"
        :width="400"
        v-bind="{ ...slotProps, ...panelBind }"
        v-model:show="show"
        :title="trans('map.legend-control.title')"
      >
        <div class="map-legend-control">
          <div class="map-legend-control__list">
            <div
              v-for="(legendVNode, index) in legends"
              :key="index"
              class="map-legend-control__item"
            >
              <div class="map-legend-control__icon">
                <component :is="legendVNode.icon" />
              </div>
              <span>{{ legendVNode.name }}</span>
            </div>
          </div>
          <div class="map-legend-control__action">
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
