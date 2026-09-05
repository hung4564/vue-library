# Map

## Props

| Prop                | Description | Type     | Required | Default Value |
| ------------------- | ----------- | -------- | -------- | ------------- |
| `mapboxAccessToken` |             | `string` | `fasle`  | --            |
| `initOptions`       |             | `object` | `fasle`  | --            |
| `dragId`            |             | `string` | `fasle`  | --            |
| `mapId`             |             | `string` | `fasle`  | --            |

## Events

| Name          | Description                |
| ------------- | -------------------------- |
| `map-loaded`  | `(map: MapSimple) => void` |
| `map-destroy` | `(map: MapSimple) => void` |

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Usage

##### Basic

###### Vue

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
</script>

<template>
  <Map />
</template>
```

###### React

```tsx
import { Map } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map />
```

##### Custom initOptions

###### Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Map } from '@hungpvq/vue-map-core';

const initOptions = ref({
  center: [105.8342, 21.0285],
  zoom: 10,
  style: 'https://demotiles.maplibre.org/style.json',
  attributionControl: false,
});
</script>

<template>
  <Map :initOptions="initOptions" />
</template>
```

###### React

```tsx
import { Map } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

const initOptions = {
  center: [105.8342, 21.0285] as [number, number],
  zoom: 10,
  style: 'https://demotiles.maplibre.org/style.json',
  attributionControl: false,
};

<Map initOptions={initOptions} />
```

##### Handle events

###### Vue

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';

function onMapLoaded(map) {
  console.info('loaded', map);
}
function onMapDestroy(map) {
  console.info('destroy', map);
}
</script>

<template>
  <Map @map-loaded="onMapLoaded" @map-destroy="onMapDestroy" />
</template>
```

###### React

```tsx
import { Map } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

function onMapLoaded(map) {
  console.info('loaded', map);
}
function onMapDestroy(map) {
  console.info('destroy', map);
}

<Map onMapLoaded={onMapLoaded} onMapDestroy={onMapDestroy} />
```

##### Multiple maps

###### Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Map } from '@hungpvq/vue-map-core';

const ids = [ref('map-1'), ref('map-2')];
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <Map :mapId="ids[0].value" />
    <Map :mapId="ids[1].value" />
  </div>
</template>
```

###### React

```tsx
import { Map } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<div className="grid grid-cols-2 gap-4">
  <Map mapId="map-1" />
  <Map mapId="map-2" />
</div>
```

##### Dynamic style switch

###### Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Map } from '@hungpvq/vue-map-core';

const options = ref({
  style: 'https://demotiles.maplibre.org/style.json',
});

function useDark() {
  options.value = { ...options.value, style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' };
}
</script>

<template>
  <div>
    <button @click="useDark">Use dark style</button>
    <Map :initOptions="options" />
  </div>
</template>
```

###### React

```tsx
import { useState } from 'react';
import { Map } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

function StyleSwitch() {
  const [options, setOptions] = useState({
    style: 'https://demotiles.maplibre.org/style.json',
  });

  function useDark() {
    setOptions((prev) => ({
      ...prev,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    }));
  }

  return (
    <div>
      <button onClick={useDark}>Use dark style</button>
      <Map initOptions={options} />
    </div>
  );
}
```

##### Programmatic navigation (flyTo)

###### Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Map, useMap } from '@hungpvq/vue-map-core';

const mapId = ref('example-map');
const { callMap } = useMap(mapId.value);

function flyToHanoi() {
  callMap((map) => {
    map?.flyTo({ center: [105.8342, 21.0285], zoom: 12 });
  });
}
</script>

<template>
  <div>
    <button @click="flyToHanoi">Fly to Hà Nội</button>
    <Map :mapId="mapId" />
  </div>
</template>
```

###### React

```tsx
import { Map, useMap } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

function FlyToExample() {
  const { callMap } = useMap({ mapId: 'example-map' });

  function flyToHanoi() {
    callMap((map) => {
      map?.flyTo({ center: [105.8342, 21.0285], zoom: 12 });
    });
  }

  return (
    <div>
      <button onClick={flyToHanoi}>Fly to Hà Nội</button>
      <Map mapId="example-map" />
    </div>
  );
}
```

## Theming and Styling

The map library supports extensive customization through CSS variables. All variables are prefixed with `--map-` to avoid conflicts.

### Quick Start with Themes

1.  **Import the base theme styles**:

    ```typescript
    import '@hungpvq/vue-map-core/src/styles/themes.css';
    ```

2.  **Apply a theme class** to your application container:
    ```html
    <!-- Dark Mode -->
    <div class="map-theme-dark">
      <map />
    </div>
    ```

For a full list of available CSS variables and advanced customization options, see the [CSS Variables Reference](../../css-variables.md).

## Core Hooks

For comprehensive documentation on core hooks including `useMap`, `useShow`, and advanced usage patterns, see [Core Hooks Guide](../../hook/index.md).

## Creating Custom Controls

For comprehensive examples of creating custom controls using ModuleContainer, see [Custom Controls Guide](./custom-controls.md).
