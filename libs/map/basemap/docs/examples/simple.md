### Basic Basemap Control

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <BaseMapControl position="bottom-left" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { BaseMapControl } from '@hungpvq/vue-map-basemap';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-basemap/style.css';

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}
</script>
```

### Basemap with Tags

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <BaseMapTagControl position="bottom-left" />
    <BaseMapControl position="bottom-left" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { BaseMapControl, BaseMapTagControl } from '@hungpvq/vue-map-basemap';

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}
</script>
```
