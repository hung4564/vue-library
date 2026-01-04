<script setup lang="ts">
import { fitBounds } from '@hungpvq/shared-map';
import {
  defaultMapProps,
  UniversalRegistry,
  useMap,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import {
  MenuClickAddComponent,
  MenuClickFitBounds,
  MenuClickHighlight,
  MenuItemProps,
} from '../extra';
import { useMapDatasetComponent, useMapDatasetHighlight } from '../store';

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const { mapId, callMap } = useMap(props);
const { addComponent } = useMapDatasetComponent(mapId.value);
const { setFeatureHighlight } = useMapDatasetHighlight(mapId.value);

// Register menu handlers using UniversalRegistry
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  'addComponent',
  ({ value }: MenuItemProps<MenuClickAddComponent>) => {
    if (value) addComponent(value);
  },
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  'fitBounds',
  ({ value }: MenuItemProps<MenuClickFitBounds>) => {
    callMap((map) => {
      fitBounds(map, value?.detail);
    });
  },
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  'highlight',
  ({ value, layer }: MenuItemProps<MenuClickHighlight>) => {
    if (value) setFeatureHighlight(value.detail, value.key, layer);
  },
);
</script>
<template>
  <div></div>
</template>
