# ModuleContainer

## Usecase

- Wrap custom controls with consistent draggable/toggleable behavior.
- Standardize control chrome (button, header) across modules.

## Props

<!--@include: ./props.md-->

## Events

## Slots

| Name         | Description |
| ------------ | ----------- |
| `btn`        | Control chrome inside `.btn-module-container` (flex `order` applies here) |
| `btnOutside` | Same corner Teleport target as `btn`, but **sibling outside** `.btn-module-container` — use for absolute panels that must pin to the map corner host (e.g. toolbar/menu More). React: `btnOutside` prop |
| `draggable`  |             |

## Usage

### Vue

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
import type { WithMapPropType } from '@hungpvq/map-core';
import { MapControlButton, ModuleContainer, defaultMapProps } from '@hungpvq/vue-map-core';
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

### React

```tsx
import {
  MapControlButton,
  ModuleContainer,
  defaultMapProps,
  useMap,
} from '@hungpvq/react-map-core';
import type { WithMapPropType } from '@hungpvq/map-core';
import { Icon } from '@mdi/react';
import { mdiHome } from '@mdi/js';
import type { ReactNode } from 'react';

type Props = WithMapPropType & {
  title?: string;
  children?: ReactNode;
};

function HomeModule(props: Props) {
  const merged = { ...defaultMapProps, title: '', ...props };
  const { moduleContainerProps } = useMap(merged);

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <MapControlButton>
          <Icon path={mdiHome} size="18px" />
        </MapControlButton>
      }
    >
      {props.children}
    </ModuleContainer>
  );
}
```
