# Core Hooks

The core hooks provide essential functionality for interacting with maps and managing component state.

## useMap

The `useMap` hook provides access to the map instance and container properties for a specific map ID.

### Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useMap } from '@hungpvq/vue-map-core';

const mapId = ref('my-map');
const { callMap, mapId: mapIdRef, moduleContainerProps } = useMap(mapId.value);

function handleClick() {
  callMap((map: MapSimple) => {
    map.flyTo({ center: [0, 0], zoom: 2 });
  });
}

console.info('mapId:', mapIdRef.value);
</script>
```

### React

```tsx
import { useMap } from '@hungpvq/react-map-core';

function FlyToButton() {
  const { callMap, mapId } = useMap({ mapId: 'my-map' });

  function handleClick() {
    callMap((map) => {
      map.flyTo({ center: [0, 0], zoom: 2 });
    });
  }

  return <button onClick={handleClick}>Fly to origin ({mapId})</button>;
}
```

### useMap Return Values

| Property               | Type                                           | Description                                       |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------- |
| `callMap()`            | `(callback: (map: MapSimple) => void) => void` | Function that executes callback with map instance |
| `mapId`                | `string` (React) / `Ref<string>` (Vue)         | Map ID                                            |
| `moduleContainerProps` | `object`                                       | Props for ModuleContainer positioning             |

## useShow

The `useShow` hook provides visibility state management for map controls.

### Vue

```vue
<script setup lang="ts">
import { useShow } from '@hungpvq/vue-map-core';

const { isShow, toggle, show, hide } = useShow();
</script>

<template>
  <div v-if="isShow" class="map-control">
    <button @click="toggle">Toggle</button>
    <button @click="show">Show</button>
    <button @click="hide">Hide</button>
  </div>
</template>
```

### React

```tsx
import { useShow } from '@hungpvq/react-map-core';

function Panel() {
  const [isShow, toggleShow] = useShow(false);

  return (
    <div>
      <button onClick={() => toggleShow()}>Toggle</button>
      <button onClick={() => toggleShow(true)}>Show</button>
      <button onClick={() => toggleShow(false)}>Hide</button>
      {isShow && <div className="map-control">Panel content</div>}
    </div>
  );
}
```

### useShow Return Values

| Framework | Return | Description |
| --------- | ------ | ----------- |
| Vue | `{ isShow, toggle, show, hide }` | Reactive visibility helpers |
| React | `[show, toggleShow]` | `useState`-style tuple; `toggleShow()` flips, `toggleShow(true\|false)` sets |

## Hook Usage Examples

### Advanced Map Control with Hooks

#### Vue

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useMap, useShow } from '@hungpvq/vue-map-core';

const mapId = ref('advanced-map');
const { callMap, mapId: mapIdRef } = useMap(mapId.value);
const { isShow, toggle } = useShow();

watch(mapIdRef, (id) => {
  if (id) {
    callMap((map: MapSimple) => {
      // Add custom layers, sources, etc.
    });
  }
});

function addCustomLayer() {
  callMap((map: MapSimple) => {
    map.addSource('custom-data', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id: 'custom-layer',
      type: 'circle',
      source: 'custom-data',
      paint: { 'circle-radius': 6, 'circle-color': '#ff0000' },
    });
  });
}
</script>

<template>
  <div>
    <button @click="toggle">{{ isShow ? 'Hide' : 'Show' }} Controls</button>
    <div v-if="isShow">
      <button @click="addCustomLayer">Add Custom Layer</button>
    </div>
  </div>
</template>
```

#### React

```tsx
import { useEffect } from 'react';
import { useMap, useShow } from '@hungpvq/react-map-core';

function AdvancedControls() {
  const { callMap, mapId } = useMap({ mapId: 'advanced-map' });
  const [isShow, toggleShow] = useShow(false);

  useEffect(() => {
    if (!mapId) return;
    callMap(() => {
      // Map ready
    });
  }, [mapId, callMap]);

  function addCustomLayer() {
    callMap((map) => {
      map.addSource('custom-data', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'custom-layer',
        type: 'circle',
        source: 'custom-data',
        paint: { 'circle-radius': 6, 'circle-color': '#ff0000' },
      });
    });
  }

  return (
    <div>
      <button onClick={() => toggleShow()}>{isShow ? 'Hide' : 'Show'} Controls</button>
      {isShow && <button onClick={addCustomLayer}>Add Custom Layer</button>}
    </div>
  );
}
```

### Hook with Multiple Maps

#### Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useMap } from '@hungpvq/vue-map-core';

const mapIds = ref(['map-1', 'map-2', 'map-3']);
const mapInstances = mapIds.value.map((id) => useMap(id));

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
</script>
```

#### React

```tsx
import { useMap } from '@hungpvq/react-map-core';

function SyncMapsButton() {
  const a = useMap({ mapId: 'map-1' });
  const b = useMap({ mapId: 'map-2' });
  const c = useMap({ mapId: 'map-3' });
  const maps = [a, b, c];

  function syncMaps() {
    let center: any, zoom: any;
    maps[0].callMap((firstMap) => {
      center = firstMap.getCenter();
      zoom = firstMap.getZoom();
    });
    if (!center || zoom == null) return;
    maps.forEach(({ callMap }) => {
      callMap((map) => {
        map.flyTo({ center: center.toArray(), zoom });
      });
    });
  }

  return <button onClick={syncMaps}>Sync maps</button>;
}
```

## Best Practices

1. **Always check map existence** before calling map methods
2. **Pass a stable `mapId`** (string prop / context)
3. **Combine hooks** for complex functionality rather than creating monolithic hooks
4. **Clean up listeners** when components unmount
5. **Use derived state** (`useMemo` / `computed`) for values computed from hook state
