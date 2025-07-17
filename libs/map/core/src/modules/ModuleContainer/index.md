---
category: Container
package: vue-map
---

# ModuleContainer

<FunctionInfo :frontmatter="$frontmatter" fn="ModuleContainer" />

## Props

<!--@include: ./props.md-->

## Events

## Slots

| Name        | Description |
| ----------- | ----------- |
| `btn`       |             |
| `draggable` | id:string   |

## Usage

```vue
<script setup lang="ts">
import { MapControlButton, ModuleContainer, withMapProps } from '@hungpvq/vue-map-core';
const props = defineProps({
  ...withMapProps,
  title: {
    type: String,
    default: '',
  },
});
const { moduleContainerProps } = useMap(props);
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton>
        <SvgIcon :size="18" type="mdi" :path="mdiHome" />
      </MapControlButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
```

```vue
<script setup lang="ts">
import { MapControlButton, ModuleContainer, { ... defaultMapProps}, type WithMapPropType } from '@hungpvq/vue-map-core';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      title: string;
    }
  >(),
  {
    ...defaultMapProps,
    title: '',
  },
);
const { moduleContainerProps } = useMap(props);
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton>
        <SvgIcon :size="18" type="mdi" :path="mdiHome" />
      </MapControlButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
```
