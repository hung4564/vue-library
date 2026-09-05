# RegistryControl

Inspector for controls registered on the map through `UniversalRegistry`. Lists ids, panel kind, open state, and props; search, open / close / move panels and run actions.

## Usecase

- Debug which ModuleContainer controls are mounted.
- Filter the list by id, title, panel kind, or action type.
- Drive `openControl` / `closeControl` / `setControlPosition` / `runControlAction` from the UI.

## Props

<!--@include: ./props.md-->

and

| Prop   | Description              | Type      | Required | Default Value    |
| ------ | ------------------------ | --------- | -------- | ---------------- |
| `show` | Open the panel initially | `boolean` | `false`  | `false`          |

## Events

None.

## Usage

### Vue

```vue
<script setup lang="ts">
import { Map, RegistryControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
</script>

<template>
  <Map>
    <RegistryControl position="top-right" />
  </Map>
</template>
```

### React

```tsx
import { Map, RegistryControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map>
  <RegistryControl position="top-right" />
</Map>
```

API details: [UniversalRegistry controls](../registry-controls.md).
