# Core Hooks

The core hooks provide essential functionality for interacting with maps and managing component state.

## useMap

The `useMap` hook provides access to the map instance and container properties for a specific map ID.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useMap } from '@hungpvq/vue-map-core';

const mapId = ref('my-map');
const { callMap, mapId, moduleContainerProps } = useMap(mapId.value);

// Get map instance
function handleClick() {
  callMap((map: MapSimple) => {
    map.flyTo({ center: [0, 0], zoom: 2 });
  });
}

// Check map state
console.info('mapId:', mapId.value);
</script>
```

### useMap Return Values

| Property               | Type                                           | Description                                       |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------- |
| `callMap()`            | `(callback: (map: MapSimple) => void) => void` | Function that executes callback with map instance |
| `mapId`                | `Ref<string>`                                  | Reactive string for the map ID                    |
| `moduleContainerProps` | `object`                                       | Props for ModuleContainer positioning             |

## useShow

The `useShow` hook provides reactive visibility state management for map controls.

```vue
<script setup lang="ts">
import { useShow } from '@hungpvq/vue-map-core';

const { isShow, toggle, show, hide } = useShow();

// Toggle visibility
function handleToggle() {
  toggle();
}

// Show control
function showControl() {
  show();
}

// Hide control
function hideControl() {
  hide();
}
</script>

<template>
  <div v-if="isShow" class="map-control">
    <button @click="handleToggle">Toggle</button>
    <button @click="showControl">Show</button>
    <button @click="hideControl">Hide</button>
  </div>
</template>
```

### useShow Return Values

| Property | Type           | Description                                   |
| -------- | -------------- | --------------------------------------------- |
| `isShow` | `Ref<boolean>` | Reactive boolean for current visibility state |
| `toggle` | `() => void`   | Function to toggle visibility                 |
| `show`   | `() => void`   | Function to show control                      |
| `hide`   | `() => void`   | Function to hide control                      |

## Hook Usage Examples

### Advanced Map Control with Hooks

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useMap, useShow } from '@hungpvq/vue-map-core';

const mapId = ref('advanced-map');
const { callMap, mapId: mapIdRef } = useMap(mapId.value);
const { isShow, toggle } = useShow();

// Watch for map loading
watch(mapIdRef, (id) => {
  if (id) {
    console.info('Map is ready for interaction');
    callMap((map: MapSimple) => {
      // Add custom layers, sources, etc.
    });
  }
});

// Custom map operations
function addCustomLayer() {
  callMap((map: MapSimple) => {
    map.addSource('custom-data', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    map.addLayer({
      id: 'custom-layer',
      type: 'circle',
      source: 'custom-data',
      paint: {
        'circle-radius': 6,
        'circle-color': '#ff0000',
      },
    });
  });
}

function removeCustomLayer() {
  callMap((map: MapSimple) => {
    if (map.getLayer('custom-layer')) {
      map.removeLayer('custom-layer');
    }
    if (map.getSource('custom-data')) {
      map.removeSource('custom-data');
    }
  });
}
</script>

<template>
  <div>
    <button @click="toggle" class="mb-2">{{ isShow ? 'Hide' : 'Show' }} Controls</button>

    <div v-if="isShow" class="space-y-2">
      <button @click="addCustomLayer" class="block w-full">Add Custom Layer</button>
      <button @click="removeCustomLayer" class="block w-full">Remove Custom Layer</button>
    </div>
  </div>
</template>
```

### Hook with Multiple Maps

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useMap, useShow } from '@hungpvq/vue-map-core';

const mapIds = ref(['map-1', 'map-2', 'map-3']);
const mapInstances = mapIds.value.map((id) => useMap(id));
const { isShow, toggle } = useShow();

// Synchronize all maps
function syncMaps() {
  let center: any, zoom: any;

  mapInstances[0].callMap((firstMap: MapSimple) => {
    center = firstMap.getCenter();
    zoom = firstMap.getZoom();
  });

  if (!center || !zoom) return;

  mapInstances.forEach(({ callMap }) => {
    callMap((map: MapSimple) => {
      map.flyTo({ center: center.toArray(), zoom });
    });
  });
}

// Get all loaded maps
function getAllMaps() {
  const maps: MapSimple[] = [];
  mapInstances.forEach(({ callMap }) => {
    callMap((map: MapSimple) => {
      maps.push(map);
    });
  });
  return maps;
}
</script>
```

### Creating Custom Hook

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMap } from '@hungpvq/vue-map-core';

// Custom hook for map statistics
function useMapStats(mapId: string) {
  const { callMap, mapId: mapIdRef } = useMap(mapId);
  const stats = ref({
    zoom: 0,
    center: [0, 0],
    bearing: 0,
    pitch: 0,
  });

  const isAtMaxZoom = computed(() => stats.value.zoom >= 20);
  const isAtMinZoom = computed(() => stats.value.zoom <= 0);

  function updateStats() {
    callMap((map: MapSimple) => {
      stats.value = {
        zoom: map.getZoom(),
        center: map.getCenter().toArray(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      };
    });
  }

  function resetView() {
    callMap((map: MapSimple) => {
      map.flyTo({
        center: [0, 0],
        zoom: 0,
        bearing: 0,
        pitch: 0,
      });
    });
  }

  return {
    stats,
    isAtMaxZoom,
    isAtMinZoom,
    updateStats,
    resetView,
  };
}

// Usage
const { stats, isAtMaxZoom, isAtMinZoom, updateStats, resetView } = useMapStats('my-map');
</script>
```

## Best Practices

1. **Always check map existence** before calling map methods
2. **Use reactive refs** for map IDs to ensure proper reactivity
3. **Combine hooks** for complex functionality rather than creating monolithic hooks
4. **Handle loading states** with `mapId` reactive reference
5. **Clean up resources** when components unmount
6. **Use computed properties** for derived state from hook values

## Hook Composition Patterns

### Combining Multiple Hooks

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMap, useShow } from '@hungpvq/vue-map-core';

function useMapControl(mapId: string) {
  const { callMap, mapId: mapIdRef } = useMap(mapId);
  const { isShow, toggle } = useShow();

  const isReady = computed(() => mapIdRef.value && isShow.value);

  function performAction() {
    if (!isReady.value) return;

    callMap((map: MapSimple) => {
      // Perform map action
    });
  }

  return {
    isReady,
    performAction,
    toggle,
    callMap,
  };
}
</script>
```

### Hook with Side Effects

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useMap } from '@hungpvq/vue-map-core';

function useMapWithEvents(mapId: string) {
  const { callMap, mapId: mapIdRef } = useMap(mapId);

  onMounted(() => {
    // Setup initial state
  });

  onUnmounted(() => {
    // Cleanup
    callMap((map: MapSimple) => {
      map.off('click');
      map.off('move');
    });
  });

  return { callMap, mapId: mapIdRef };
}
</script>
```
