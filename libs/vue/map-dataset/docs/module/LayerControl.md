# Layer Control

Editable layer list: create, group, reorder, delete, run menus.

## Props

<!--@include: ../../core/module/props.md-->

| Prop | Type | Default | Effect |
| --- | --- | --- | --- |
| `show` | `boolean` | — | Open the panel |
| `disabledCreate` | `boolean` | `false` | Hide create-layer |
| `disabledCreateGroup` | `boolean` | `false` | Hide create-group **and** hide Add to group in ⋮ |
| `disabledDeleteAll` | `boolean` | `false` | Hide delete-all |
| `disabledMove` | `boolean` | `false` | Hide Move up/down in ⋮ |
| `menuContext` | `object \| (() => object)` | — | Bag for `setHidden` / `setDisabled` |

`menuContext` is merged with `readonly`, `disabledMove`, `disabledCreateGroup` and any parent `provideMenuConditionContext` / `MenuConditionProvider`. See [Menus](../create-dataset/with-helper-menu.md).

**Events:** none. Visibility / opacity fire on the list node (`toggleShow`, `changeOpacity`) — see [Events](../create-dataset/with-helper-event.md). Dialogs from ⋮ menus need [`ComponentManagementControl`](./ComponentManagementControl.md). Create-layer uses [`CreateControl`](./CreateControl.md) internally.

When [`MapContextMenuControl`](/map/core/module/MapContextMenuControl) is on the same map, Quick analysis includes **Buffer 500 m here**, **Buffer 1 km here**, and **Buffer 5 km here**. Clicking one adds a GeoJSON circle layer (with a **Fill bound** extra button).

## Slots / render props

| Name | Vue | React |
| --- | --- | --- |
| `titleList` | slot `{ mapId }` | `ReactNode \| ({ mapId }) => ReactNode` |
| `endList` | slot `{ mapId }` | same |
| `default` | extra children | `children` |

## Vue

```vue
<script setup lang="ts">
import { reactive } from 'vue';
import { Map, BaseMapCard } from '@hungpvq/vue-map-core';
import { LayerControl, ComponentManagementControl } from '@hungpvq/vue-map-dataset';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';

const menuUi = reactive({ role: 'admin', canUsePen: true });
</script>

<template>
  <Map>
    <LayerControl
      position="top-left"
      show
      :disabled-create="false"
      :disabled-create-group="false"
      :disabled-delete-all="false"
      :disabled-move="false"
      :menu-context="menuUi"
    >
      <template #titleList="{ mapId }">
        <button type="button">Extra header ({{ mapId }})</button>
      </template>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <ComponentManagementControl />
  </Map>
</template>
```

## React

```tsx
<LayerControl
  position="top-left"
  show
  disabledCreateGroup={false}
  disabledMove={false}
  menuContext={{ role: 'admin', canUsePen: true }}
  titleList={<button type="button">Extra header</button>}
  endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
/>
<ComponentManagementControl />
```

Read-only list: [`LayerInfoControl`](./LayerInfoControl.md).
