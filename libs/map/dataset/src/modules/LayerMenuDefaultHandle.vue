<script setup lang="ts">
import { fitBounds } from '@hungpvq/shared-map';
import {
  defaultMapProps,
  useMap,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import { UniversalRegistry } from '../registry';
import {
  ComponentItem,
  useMapDatasetComponent,
  useMapDatasetHighlight,
} from '../store';

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
  (layer, mapId: string, component: ComponentItem) => {
    addComponent(component);
  },
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  'fitBounds',
  (layer, mapId: string, geometry: any) => {
    callMap((map) => {
      fitBounds(map, geometry);
    });
  },
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  'highlight',
  (
    layer,
    mapId: string,
    props: {
      detail: any;
      key: string;
    },
  ) => {
    setFeatureHighlight(props.detail, props.key, layer);
  },
);
</script>
<template>
  <div></div>
</template>
