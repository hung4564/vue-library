<script setup lang="ts">
import { fitBounds } from '@hungpvq/shared-map';
import {
  defaultMapProps,
  useMap,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import { registerMenuHandler } from '../extra/menu';
import { useMapDatasetComponent, useMapDatasetHighlight } from '../store';

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const { mapId, callMap } = useMap(props);
const { addComponent } = useMapDatasetComponent(mapId.value);
const { setFeatureHighlight } = useMapDatasetHighlight(mapId.value);
registerMenuHandler('addComponent', (layer, mapId: string, component: any) => {
  addComponent(component);
});
registerMenuHandler('fitBounds', (layer, mapId: string, geometry: any) => {
  callMap((map) => {
    fitBounds(map, geometry);
  });
});
registerMenuHandler(
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
