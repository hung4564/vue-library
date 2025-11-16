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

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
</script>

<template>
  <Map />
</template>
```

##### Custom initOptions

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

##### Handle events

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

##### Multiple maps

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

##### Dynamic style switch

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

##### Programmatic navigation (flyTo)

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

## Core Hooks

For comprehensive documentation on core hooks including `useMap`, `useShow`, and advanced usage patterns, see [Core Hooks Guide](../../hook/index.md).

## Creating Custom Controls

For comprehensive examples of creating custom controls using ModuleContainer, see [Custom Controls Guide](./custom-controls.md).
