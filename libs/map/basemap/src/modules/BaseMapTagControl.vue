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
import { logHelper } from '@hungpvq/shared-map';
import {
  defaultMapProps,
  MapControlGroupButton,
  ModuleContainer,
  useMap,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useBaseMap } from '../hooks';
import { logger } from '../logger';
import type { BaseMapItem } from '../types';
import defaultbasemap from './basemap';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      baseMaps?: BaseMapItem[]; // hoặc cụ thể hơn nếu bạn biết kiểu phần tử
      defaultBaseMap?: string;
    }
  >(),
  {
    ...defaultMapProps,
    baseMaps: () => defaultbasemap,
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
function onClick(baseMap: any) {
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
<style scoped>
.base-map-item {
  padding: 4px 8px;
}
.base-map-item.active {
  background-color: var(--v-primary-base, #1a73e8);
  color: #fff;
  font-weight: bold;
}
.clickable {
  cursor: pointer;
}

.clickable {
  position: relative;
}

.clickable:hover::before {
  opacity: 0.04;
}

.clickable:before {
  background-color: currentColor;
  bottom: 0;
  content: '';
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.clickable[disabled='disabled'] {
  cursor: default;
  pointer-events: none;
  opacity: 0.25;
}
</style>
