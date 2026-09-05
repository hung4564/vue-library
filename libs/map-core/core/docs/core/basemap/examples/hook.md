### Using Basemap Hooks

#### Vue

```vue
<script setup lang="ts">
import { useBaseMap } from '@hungpvq/vue-map-core';
import { useMap } from '@hungpvq/vue-map-core';

const props = defineProps({
  mapId: { type: String, required: true },
});
const { mapId } = useMap(props);
const { currentBaseMap, setCurrent, baseMaps } = useBaseMap(mapId.value);

// Get current basemap
function getCurrent() {
  const current = currentBaseMap.value;
  console.info('Current basemap:', current);
}

// Set new basemap
function changeBasemap(basemap: BaseMapItem) {
  setCurrent(basemap);
}

// Get all available basemaps
function getBasemaps() {
  const basemaps = baseMaps.value;
  console.info('Available basemaps:', basemaps);
}
</script>
```

#### React

```tsx
import type { BaseMapItem } from '@hungpvq/map-core';
import { useBaseMap, useMap } from '@hungpvq/react-map-core';

function BasemapTools({ mapId: mapIdProp }: { mapId: string }) {
  const { mapId } = useMap({ mapId: mapIdProp });
  const { currentBaseMap, setCurrent, baseMaps } = useBaseMap(mapId);

  function getCurrent() {
    console.info('Current basemap:', currentBaseMap);
  }

  function changeBasemap(basemap: BaseMapItem) {
    setCurrent(basemap);
  }

  function getBasemaps() {
    console.info('Available basemaps:', baseMaps);
  }

  return null;
}
```
