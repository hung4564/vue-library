<template>
  <ModuleContainer v-bind="moduleContainerProps" :btnWidth="24">
    <template #btn>
      <MapControlGroupButton row v-if="current_baseMaps" size="24">
        <button
          type="button"
          v-for="baseMap in c_baseMaps"
          :key="baseMap.id"
          class="px-2 py-1 clickable base-map-item"
          @click="onClick(baseMap)"
          :class="{
            active: current_baseMaps && current_baseMaps.id == baseMap.id,
          }"
        >
          {{ baseMap.title }}
        </button>
      </MapControlGroupButton>
      <div v-else></div>
    </template>
    <slot />
  </ModuleContainer>
</template>
<script lang="ts" setup>
import type { BaseMapItem } from '@hungpvq/map-core';
import {
  INIT_BASEMAPS,
  logHelper,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { MapControlGroupButton } from '../../../components';
import { defaultMapProps, useMap } from '../../../hooks';
import { ModuleContainer } from '../../../modules';
import { useBaseMap } from '../hooks';
import { logger } from '../logger';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      baseMaps?: BaseMapItem[]; // hoặc cụ thể hơn nếu bạn biết kiểu phần tử
      defaultBaseMap?: string;
    }
  >(),
  {
    ...defaultMapProps,
    baseMaps: () => INIT_BASEMAPS,
    defaultBaseMap: 'Open Street Map',
  },
);
const { mapId, moduleContainerProps } = useMap(props);
const {
  setBaseMaps,
  baseMaps: c_baseMaps,
  setDefaultBaseMap,
  setCurrent,
  currentBaseMap: current_baseMaps,
  remove,
  init,
} = useBaseMap(mapId.value);
watch(
  () => props.baseMaps as BaseMapItem[],
  (value: BaseMapItem[]) => {
    setBaseMaps(value);
  },
);
watch(
  () => props.defaultBaseMap,
  (value) => {
    setDefaultBaseMap(value);
  },
);
function onClick(baseMap: BaseMapItem) {
  logHelper(logger, mapId.value, 'control', 'BaseMapTagControl').debug(
    'onClick',
    baseMap,
  );
  setCurrent(baseMap);
}
onMounted(() => {
  init(props.baseMaps, props.defaultBaseMap);
});
onBeforeUnmount(() => {
  remove();
});
</script>
