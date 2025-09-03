# Creating Custom Controls with ModuleContainer

The `ModuleContainer` provides a standardized way to create custom map controls with consistent positioning, styling, and behavior.

## Basic Custom Control

```vue
<script setup lang="ts">
import { ModuleContainer, MapControlButton, WithMapPropType, defaultMapProps } from '@hungpvq/vue-map-core';
import { useMap } from '@hungpvq/vue-map-core';

const props = withDefaults(
  defineProps<
    WithMapPropType & {
      title: string;
    }
  >(),
  {
    ...defaultMapProps,
    title: 'Custom Control',
  },
);

const { moduleContainerProps } = useMap(props);

function handleClick() {
  console.log('Custom control clicked!');
}
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton @click="handleClick">
        <span class="text-lg">🎯</span>
      </MapControlButton>
    </template>

    <div class="p-4 bg-white rounded shadow">
      <h3 class="font-bold mb-2">{{ title }}</h3>
      <p class="text-sm text-gray-600">Custom control content</p>
    </div>
  </ModuleContainer>
</template>
```

## Custom Control with State

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ModuleContainer, MapControlButton, WithMapPropType, defaultMapProps } from '@hungpvq/vue-map-core';
import { useMap } from '@hungpvq/vue-map-core';

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});

const { moduleContainerProps } = useMap(props);
const isActive = ref(false);

function toggleControl() {
  isActive.value = !isActive.value;
}
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton @click="toggleControl" :class="{ 'bg-blue-500 text-white': isActive }">
        <span class="text-lg">⚙️</span>
      </MapControlButton>
    </template>

    <div v-if="isActive" class="p-4 bg-white rounded shadow">
      <h3 class="font-bold mb-2">Settings</h3>
      <div class="space-y-2">
        <label class="flex items-center">
          <input type="checkbox" class="mr-2" />
          Show labels
        </label>
        <label class="flex items-center">
          <input type="checkbox" class="mr-2" />
          Show grid
        </label>
      </div>
    </div>
  </ModuleContainer>
</template>
```

## Custom Control with Map Integration

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ModuleContainer, MapControlButton, WithMapPropType, defaultMapProps } from '@hungpvq/vue-map-core';
import { useMap } from '@hungpvq/vue-map-core';

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});

const { moduleContainerProps, callMap } = useMap(props);
const isVisible = ref(false);

function toggleLayer() {
  const map = callMap((map) => {
    if (!map) return;

    const layerId = 'custom-layer';
    if (map.getLayoutProperty(layerId, 'visibility') === 'none') {
      map.setLayoutProperty(layerId, 'visibility', 'visible');
    } else {
      map.setLayoutProperty(layerId, 'visibility', 'none');
    }
  });
}

function addCustomMarker() {
  callMap((map) => {
    if (!map) return;

    map.addSource('custom-marker', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: map.getCenter().toArray(),
        },
        properties: { name: 'Custom Marker' },
      },
    });

    map.addLayer({
      id: 'custom-marker-layer',
      type: 'circle',
      source: 'custom-marker',
      paint: {
        'circle-radius': 8,
        'circle-color': '#ff0000',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });
  });
}
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton @click="isVisible = !isVisible">
        <span class="text-lg">📍</span>
      </MapControlButton>
    </template>

    <div v-if="isVisible" class="p-4 bg-white rounded shadow min-w-48">
      <h3 class="font-bold mb-3">Layer Control</h3>
      <div class="space-y-3">
        <button @click="toggleLayer" class="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Toggle Custom Layer</button>

        <button @click="addCustomMarker" class="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600">Add Marker</button>
      </div>
    </div>
  </ModuleContainer>
</template>
```

## Best Practices

1. **Always use `WithMapProps` and `defaultMapProps`** to inherit standard positioning and behavior
2. **Use `useMap()` hook** to get map instance and container props
3. **Provide meaningful titles** for accessibility
4. **Handle map loading states** - check if map exists before calling methods
5. **Use consistent styling** with the existing control system
6. **Implement proper cleanup** for event listeners and map modifications
