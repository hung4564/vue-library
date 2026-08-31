<script lang="ts">
export default {
  name: 'layer-control',
};
</script>

<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import {
  defaultMapProps,
  MapCommonButton,
  ModuleContainer,
  useLang,
  useMap,
  useShow,
  useToolbarControl,
  WithShowProps,
} from '@hungpvq/vue-map-core';

import { DraggableItemFloat } from '@hungpvq/vue-draggable';
import {
  mdiDelete,
  mdiDotsVertical,
  mdiGroup,
  mdiLayers,
  mdiPlus,
} from '@mdi/js';
import { watch } from 'vue';
import LayerListReadonly from './part/LayerListReadonly.vue';

const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
});
const { mapId, moduleContainerProps, order } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault({
  map: {
    'layer-info-control': {
      title: 'Layer Info Control',
    },
  },
});
const path = {
  icon: mdiLayers,
  menu: mdiDotsVertical,
  group: { create: mdiGroup },
  deleteAll: mdiDelete,
  layer: { create: mdiPlus },
};
const [show, toggleShow] = useShow(props.show);
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapLayerInfoControl',
  getState() {
    return {
      visible: !show.value,
      active: show.value,
      title: trans.value('map.layer-info-control.title'),
      order: order.value,
      icon: {
        type: 'mdi',
        path: path.icon,
      },
    };
  },
  onClick() {
    toggleShow();
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

    <template #draggable="props">
      <DraggableItemFloat
        v-bind="props"
        v-model:show="show"
        headerLocation="bottom"
      >
        <template #title>
          <span class="layer-control__title">
            {{ trans('map.layer-control.title') }}
          </span>
        </template>
        <div class="layer-control">
          <LayerListReadonly :mapId="mapId" readonly />
          <div class="base-map-card-container">
            <slot name="endList" :mapId="mapId"> </slot>
          </div>
        </div>
      </DraggableItemFloat>
    </template>

    <slot />
  </ModuleContainer>
</template>
