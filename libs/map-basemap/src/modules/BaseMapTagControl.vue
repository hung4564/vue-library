<template>
  <ModuleContainer v-bind="moduleContainerProps" :btnWidth="24">
    <template #btn>
      <MapControlGroupButton row v-if="current_baseMaps" size="24">
        <button
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
import {
  MapControlGroupButton,
  ModuleContainer,
  useMap,
  withMapProps,
} from '@hungpv97/vue-map-core';
import { watch } from 'vue';
import { useBaseMap } from '../hooks';
import type { BaseMapItem } from '../types';
import defaultbasemap from './basemap';
const props = defineProps({
  ...withMapProps,
  baseMaps: {
    type: Array,
    default: () => defaultbasemap,
  },
  defaultBaseMap: {
    type: String,
    default: 'Open Street Map',
  },
});
const { mapId, moduleContainerProps } = useMap(props);
const {
  setBaseMaps,
  baseMaps: c_baseMaps,
  setDefaultBaseMap,
  setCurrent,
  currentBaseMap: current_baseMaps,
} = useBaseMap(mapId.value);
watch(
  () => props.baseMaps as BaseMapItem[],
  (value: BaseMapItem[]) => {
    setBaseMaps(value);
  },
  { immediate: true }
);
watch(
  () => props.defaultBaseMap,
  (value) => {
    setDefaultBaseMap(value);
  },
  { immediate: true }
);
function onClick(baseMap: any) {
  setCurrent(baseMap);
}
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
