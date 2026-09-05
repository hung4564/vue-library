### Basic Basemap Control

#### Vue

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <BaseMapControl position="bottom-left" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { BaseMapControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}
</script>
```

#### React

```tsx
import { Map, BaseMapControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}

<Map onMapLoaded={onMapLoaded}>
  <BaseMapControl position="bottom-left" />
</Map>
```

### Basemap with Tags

#### Vue

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <BaseMapTagControl position="bottom-left" />
    <BaseMapControl position="bottom-left" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { BaseMapControl, BaseMapTagControl } from '@hungpvq/vue-map-core';

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}
</script>
```

#### React

```tsx
import { Map, BaseMapControl, BaseMapTagControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}

<Map onMapLoaded={onMapLoaded}>
  <BaseMapTagControl position="bottom-left" />
  <BaseMapControl position="bottom-left" />
</Map>
```
