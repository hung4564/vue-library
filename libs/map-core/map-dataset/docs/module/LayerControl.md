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

Keyboard: `/` focuses the layer search input for **that** map (`[data-map-layer-search][data-map-id="<mapId>"]`, with rAF retry until mounted). `Esc` closes the top open control and blurs search only if that map’s search was focused.

### Sidebar header (Vue ↔ React)

`LayerControl` mounts a sidebar panel. Pass a **plain `title` string** for the panel switcher menu; use Vue `#title` / React `titleNode` only for styled header text. Header layout: `[ title | after-title ] …… [ extra-btn ]` — menus with `location: 'title'` render in **`after-title` / `afterTitle`**, not trailing chrome.

| | Vue | React |
| --- | --- | --- |
| Store / switcher | `:title="trans('map.layer-control.title')"` | `title={trans('map.layer-control.title')}` |
| Styled header | `#title` slot | `titleNode={<span className="…">…</span>}` |
| Menus in header | `#after-title` | `afterTitle` |

Do **not** pass a ReactNode as React `title` — the switcher store coerces non-strings to `''` and blank menu labels appear.

### Layer list types (custom UIs)

Flat rows and drag trees use shared types from `@hungpvq/map-dataset` (not adapter-local aliases):

| Type | Role |
| --- | --- |
| `IListViewUI` | List protocol on a dataset part |
| `LayerListItem` | Flat row for LayerControl drag list (`IListViewUI` + tree `Item`, group narrowed to `{ id, name }`) |
| `LayerListTreeNode` | `TreeItem<LayerListItem>` |
| `LayerListGroupTree` | `GroupTree<LayerListItem>` |
| `ListViewGroupRef` | Normalized `{ id, name }` group on a flat row |

Use `convertListToTree` / `convertTreeToList` / `mergeEmptyGroups` with `LayerListItem[]`. See [List UI](../create-dataset/list.md).

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
import {
  LayerControl,
  ComponentManagementControl,
} from '@hungpvq/vue-map-dataset';
import '@hungpvq/map-core/style.css';
import '@hungpvq/map-dataset/style.css';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
import '@hungpvq/vue-draggable/style.css';

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

## Search behavior

- Search input uses `data-map-layer-search` + `data-map-id` and is focused by `/` shortcut (`bindMapKeyboardShortcuts`) for that map only.
- Filtering is debounced on the client (~150ms) and matching text is highlighted in row titles.
- When the query has no result, the panel shows `search-empty` instead of the regular empty-state.
