### Using Basemap Hooks

```vue
<script setup lang="ts">
import { useBaseMap } from '@hungpvq/vue-map-basemap';
import { useMap } from '@hungpvq/vue-map-core';

const props = defineProps({
  mapId: { type: String, required: true },
});
const { mapId } = useMap(props);
const { currentBaseMap, setCurrent, baseMaps } = useBaseMap(mapId.value);

// Get current basemap
function getCurrent() {
  const current = currentBaseMap.value;
  console.log('Current basemap:', current);
}

// Set new basemap
function changeBasemap(basemap: BaseMapItem) {
  setCurrent(basemap);
}

// Get all available basemaps
function getBasemaps() {
  const basemaps = baseMaps.value;
  console.log('Available basemaps:', basemaps);
}
</script>
```
