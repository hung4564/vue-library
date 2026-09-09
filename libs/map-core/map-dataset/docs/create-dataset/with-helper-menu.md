# Menus

List UI and identify nodes expose actions in four places. Build items with `createMenuBuilder()`. Click handlers receive `{ layer, mapId, value, event, meta, context }` — not `(layer, mapId)`.

| `location` | Where it renders |
| --- | --- |
| `extra` | Icon buttons on the layer title row |
| `prebottom` | Left of the bottom row (opacity lives here by default) |
| `bottom` | Right of the bottom row |
| `menu` | Context menu (⋮) |

Shared defaults (all lists, identify, attribute table) live on a [`menu` dataset part](./with-helper-data.md#menu-createdatasetpartmenucomponent) in the same tree (`findFirstLeafByType`). List rows merge `for: 'layer'`; identify and the table merge `for: 'item'`.

---

## End-to-end: conditions from app state

Define menus once on the dataset. Evaluate `hidden` / `disabled` at **render** with `menuContext` (Pinia, React state, …).

### 1. Menus on the list

```ts
import { createRootDataset, createDatasetPartListViewUiComponentBuilder } from '@hungpvq/map-dataset';
import { createMenuBuilder } from '@hungpvq/map-dataset/menu';
import { mdiPen, mdiStar } from '@mdi/js';

function createLayerWithMenus() {
  const dataset = createRootDataset('Menu conditions');
  const list = createDatasetPartListViewUiComponentBuilder('My layer')
    .addMenus([
      createMenuBuilder()
        .item()
        .setId('admin-only')
        .setLocation('menu')
        .setName('Admin only')
        .setIcon(mdiStar)
        .setHidden(({ context }) => context?.role !== 'admin')
        .setClick(({ layer }) => {
          console.info('admin action', layer.getName());
        })
        .build(),
      createMenuBuilder()
        .item()
        .setId('pen')
        .setLocation('extra')
        .setName('Pen')
        .setIcon(mdiPen)
        .setDisabled(({ context }) => !context?.canUsePen)
        .setClick(({ layer, mapId }) => {
          console.info('pen', layer.id, mapId);
        })
        .build(),
    ])
    .build();
  dataset.add(list);
  return dataset;
}
```

`setHidden` / `setDisabled` accept `boolean` or `(ctx) => boolean`.

```ts
type MenuConditionContext = {
  layer: IDataset;
  mapId?: string;
  context?: Record<string, any>; // menuContext + list flags
};
```

### 2. Vue — pass Pinia / reactive state

```vue
<script setup lang="ts">
import { reactive } from 'vue';
import { Map } from '@hungpvq/vue-map-core';
import {
  LayerControl,
  useMapDataset,
} from '@hungpvq/vue-map-dataset';
import type { MapSimple } from '@hungpvq/map-core';

const menuUi = reactive({
  role: 'admin' as 'admin' | 'viewer',
  canUsePen: true,
});

function onMapLoaded(map: MapSimple) {
  useMapDataset(map.id).addDataset(createLayerWithMenus());
}
</script>

<template>
  <Map @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show :menu-context="menuUi">
      <template #titleList>
        <label>
          <input
            type="checkbox"
            :checked="menuUi.role === 'admin'"
            @change="
              menuUi.role = ($event.target as HTMLInputElement).checked
                ? 'admin'
                : 'viewer'
            "
          />
          admin
        </label>
        <label>
          <input type="checkbox" v-model="menuUi.canUsePen" />
          pen
        </label>
      </template>
    </LayerControl>
  </Map>
</template>
```

Getter so nested store fields stay live:

```vue
<LayerControl :menu-context="() => ({ role: user.role, canUsePen: user.canUsePen })" />
```

Pinia from any ancestor (no prop):

```ts
import { provideMenuConditionContext } from '@hungpvq/vue-map-dataset';
import { useUserStore } from './stores/user';

provideMenuConditionContext(() => {
  const user = useUserStore();
  return { role: user.role, canUsePen: user.canUsePen };
});
```

### 3. React — pass hook state

```tsx
import { useState } from 'react';
import { Map } from '@hungpvq/react-map-core';
import {
  LayerControl,
  useMapDataset,
} from '@hungpvq/react-map-dataset';
import type { MapSimple } from '@hungpvq/map-core';

function Page() {
  const [menuUi, setMenuUi] = useState({
    role: 'admin' as 'admin' | 'viewer',
    canUsePen: true,
  });

  function onMapLoaded(map: MapSimple) {
    useMapDataset(map.id).addDataset(createLayerWithMenus());
  }

  return (
    <Map onMapLoaded={onMapLoaded}>
      <LayerControl
        position="top-left"
        show
        menuContext={menuUi}
        titleList={
          <>
            <label>
              <input
                type="checkbox"
                checked={menuUi.role === 'admin'}
                onChange={(e) =>
                  setMenuUi((s) => ({
                    ...s,
                    role: e.target.checked ? 'admin' : 'viewer',
                  }))
                }
              />
              admin
            </label>
            <label>
              <input
                type="checkbox"
                checked={menuUi.canUsePen}
                onChange={(e) =>
                  setMenuUi((s) => ({ ...s, canUsePen: e.target.checked }))
                }
              />
              pen
            </label>
          </>
        }
      />
    </Map>
  );
}
```

Or wrap (merges with parent):

```tsx
import { MenuConditionProvider } from '@hungpvq/react-map-dataset';

<MenuConditionProvider value={() => ({ role: user.role })}>
  <LayerControl />
</MenuConditionProvider>
```

List UI also injects `readonly`, `disabledMove`, `disabledCreateGroup`. Do not reuse those keys unless you want to override them.

---

## `createMenuBuilder()`

```ts
import { createMenuBuilder } from '@hungpvq/map-dataset/menu';

const item = createMenuBuilder().item() /* .set… */ .build();
const divider = createMenuBuilder().divider().setLocation('menu').build();
```

### `.item()`

| Method | Signature | Role |
| --- | --- | --- |
| `setId` | `(id: string)` | Needed for `updateMenu` / `removeMenu` |
| `setName` | `(name: string)` | Label |
| `setIcon` | `(mdiPath: string)` | Icon |
| `setLocation` | `'extra' \| 'bottom' \| 'prebottom' \| 'menu'` | Placement |
| `setClick` | `fn \| string \| createMenuClickBuilder()` | Action |
| `setHidden` | `boolean \| (ctx) => boolean` | Skip render when true |
| `setDisabled` | `boolean \| (ctx) => boolean` | Visible, not clickable |
| `setComponentKey` | `(key: string)` | Custom **button** (extra / bottom / prebottom) |
| `setComponentMenuKey` | `(key: string)` | Custom **context-menu row** (`location: 'menu'`) |
| `setAdditional` | `(obj)` | Extra fields, e.g. `{ order: 10 }` |
| `build` | `()` | `MenuAction` |

### `.divider()`

`setLocation`, `setHidden`, `setDisabled`, `build`.

```ts
list.addMenus([
  createMenuBuilder()
    .item()
    .setLocation('menu')
    .setName('Export')
    .setIcon(mdiDownload)
    .setClick(({ layer }) => exportLayer(layer))
    .build(),
  createMenuBuilder().divider().setLocation('menu').build(),
  createMenuBuilder()
    .item()
    .setLocation('menu')
    .setName('Delete extra')
    .setHidden(true) // never shown
    .setClick(() => {})
    .build(),
]);
```

Chain on the list builder before `.build()`:

```ts
createDatasetPartListViewUiComponentBuilder('Layer')
  .addMenu(item)
  .addMenus([a, b])
  .build();
```

---

## `createMenuClickBuilder()`

Compose one or more actions for `setClick`.

```ts
import { createMenuClickBuilder } from '@hungpvq/map-dataset/menu';

createMenuBuilder()
  .item()
  .setLocation('extra')
  .setName('Fly')
  .setClick(
    createMenuClickBuilder()
      .addCommand(({ layer, mapId }) => {
        console.info(layer.id, mapId);
      })
      .addTupleStatic('fitBounds', {
        value: [105.8, 21.0, 105.9, 21.1],
      })
      .build(),
  )
  .build();
```

| Method | Use |
| --- | --- |
| `addCommand(name)` | Registry handler: `UniversalRegistry.registerMenuHandler(name, fn)` |
| `addCommand(fn)` | `({ layer, mapId, value, event, meta, context }) => void` |
| `addCommand({ execute })` | Object handler |
| `addCommands([...])` | Several of the above |
| `addTupleStatic(key, props)` | Dispatch `key` with extra props |
| `addTupleDynamic(key, (props) => partial)` | Compute props then dispatch |
| `build()` | One action, or an array if several |

Built-in click-handler keys: `LIST_VIEW_MENU_ID.addComponent`, `.fitBounds`, `.highlight`. Menu ids are nested under `LIST_VIEW_MENU_ID.layer` (list row) and `LIST_VIEW_MENU_ID.item` (identify / attribute-table row).

```ts
createMenuClickBuilder()
  .addTupleDynamic('addComponent', ({ layer }) => ({
    value: createMenuClickAddComponentBuilder()
      .setComponentKey('style-control')
      .setAttr({ item: layer })
      .build(),
  }))
  .build();
```

`createMenuClickHighlightBuilder().setDetail(feature).setKey('identify').build()`  
`createMenuClickAddComponentBuilder().setComponentKey(key).setAttr({}).setCheck('detail').build()`

---

## Built-in item factories

All return a `MenuAction`. Most accept an optional last argument that overlays fields (`order`, `name`, `hidden`, …) via `setAdditional`.

```ts
import { createMenuItemToggleShow, createMenuItemSetOpacity, createMenuItemStyleEdit, createMenuItemShowDetailInfoSource, createMenuItemToBoundActionForList, createMenuItemIdentifyForList, createMenuItemShowDetailForItem, createMenuItemToBoundActionForItem, createMenuItemMoveUp, createMenuItemMoveDown, createMenuItemAddToGroup } from '@hungpvq/map-dataset/menu';
import { createMenuItemExportGeo } from '@hungpvq/map-dataset/geo-export';
import { createMenuItemAttributeTable } from '@hungpvq/map-dataset';

list.addMenus([
  createMenuItemToggleShow(),
  createMenuItemIdentifyForList(),
  createMenuItemIdentifyForList({ location: 'menu' }),
  createMenuItemStyleEdit(),
  createMenuItemShowDetailInfoSource(),
  createMenuItemToBoundActionForList(),
]);

identify.addMenus([
  createMenuItemToBoundActionForItem(),
  createMenuItemShowDetailForItem([
    { text: 'Id', value: 'id' },
    { text: 'Name', value: 'name' },
  ]),
]);
```

| Function | `for` | Default location | `id` | Auto-added |
| --- | --- | --- | --- | --- |
| [`createMenuItemToggleShow`](#createmenuitemtoggleshow) | `layer` | `extra` | `LIST_VIEW_MENU_ID.layer.toggleShow` | — (add yourself) |
| [`createMenuItemSetOpacity`](#createmenuitemsetopacity) | `layer` | `prebottom` | `LIST_VIEW_MENU_ID.layer.setOpacity` | List UI unless `configDisabledOpacity()` |
| [`createMenuItemStyleEdit`](#createmenuitemstyleedit) | `layer` | `extra` (unset → default) | `LIST_VIEW_MENU_ID.layer.styleEdit` | — |
| [`createMenuItemShowDetailInfoSource`](#createmenuitemshowdetailinfosource) | `layer` | unset | `LIST_VIEW_MENU_ID.layer.info` | — |
| [`createMenuItemToBoundActionForList`](#createmenuitemtoboundactionforlist) | `layer` | `extra` | `LIST_VIEW_MENU_ID.layer.fillBound` | [`createGeoJsonDataset`](../helper/QuickDatasetCreation.md) / raster helper |
| [`createMenuItemIdentifyForList`](#createmenuitemidentifyforlist) | `layer` | `extra` (or `menu`) | `LIST_VIEW_MENU_ID.layer.identify` / `.identifyMenu` | [`createGeoJsonDataset`](../helper/QuickDatasetCreation.md) (extra); hidden without identify sibling or without IdentifyControl mounted |
| [`createMenuItemMoveUp`](#createmenuitemmoveup--createmenuitemmovedown) / [`MoveDown`](#createmenuitemmoveup--createmenuitemmovedown) | `layer` | `menu` | `LIST_VIEW_MENU_ID.layer.moveUp` / `.moveDown` | List UI unless `configDisabledMove()` |
| [`createMenuItemAddToGroup`](#createmenuitemaddtogroup) | `layer` | `menu` | `LIST_VIEW_MENU_ID.layer.addToGroup` | List UI unless `configDisabledAddToGroup()` |
| [`createMenuItemExportGeo`](#createmenuitemexportgeo) | `layer` | `menu` | `LIST_VIEW_MENU_ID.layer.exportGeo` | List UI unless `configDisabledExport()` |
| [`createMenuItemAttributeTable`](#createmenuitemattributetable) | `layer` | `menu` | `LIST_VIEW_MENU_ID.layer.attributeTable` | List UI unless `configDisabledAttributeTable()` |
| [`createMenuItemShowDetailForItem`](#createmenuitemshowdetailforitem) | `item` | `menu` | `LIST_VIEW_MENU_ID.item.showDetail` | Identify builders |
| [`createMenuItemToBoundActionForItem`](#createmenuitemtoboundactionforitem) | `item` | `menu` | `LIST_VIEW_MENU_ID.item.flyTo` | Identify builders |

---

### `createMenuItemToggleShow`

Visibility toggle on the layer title row. Renders the registry component `layer-action-toggle-show` (`LIST_VIEW_MENU_COMPONENT_KEY.toggleShow`), not a plain click handler.

| | |
| --- | --- |
| **Signature** | `(menu?: Partial<Omit<MenuItemCustomComponentBottomOrExtra, 'type' \| 'click'>>) => MenuAction` |
| **Location** | `extra` |
| **Id** | `LIST_VIEW_MENU_ID.layer.toggleShow` (`toggle-show`) |
| **Needs** | List node with `WithToggleShow` (`show` / `toggleShow`) |

```ts
list.addMenus([
  createMenuItemToggleShow(),
  createMenuItemToggleShow({ order: 1, name: 'Visibility' }),
]);
```

### Customize the toggle UI

Two registry keys:

| Key | Constant | Role |
| --- | --- | --- |
| `layer-action-toggle-show` | `toggleShow` | Full logic + default button (or custom via menu `componentKey`) |
| `layer-action-toggle-show-button` | `toggleShowButton` | Button UI only (per-layer default and “show all”) |

**Map-wide button** (every layer using the default toggle, plus show-all): override `toggleShowButton` with `registerComponentForMap`.

**One layer:** pass a custom `componentKey` on the menu item and register a component that wraps `ToggleShow` (reuse logic; customize UI via slot / `renderButton`).

```ts
import { LIST_VIEW_MENU_COMPONENT_KEY, createMenuItemToggleShow } from '@hungpvq/map-dataset/menu';
import { UniversalRegistry } from '@hungpvq/vue-map-core'; // or react-map-core

createMenuItemToggleShow({
  componentKey: 'demo-layer-toggle-show',
});

function onMapLoaded(map: MapSimple) {
  UniversalRegistry.registerComponentForMap(
    map.id,
    LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton,
    SampleToggleShowButton,
  );
  UniversalRegistry.registerComponentForMap(
    map.id,
    'demo-layer-toggle-show',
    SampleLayerToggleShow,
  );
}
```

Register in `onMapLoaded` so map-scoped entries survive remount — see [UniversalRegistry components](/map/core/registry-components).

Demo: Vue / React `#/dataset-menu`.

---

### `createMenuItemSetOpacity`

Opacity slider on the bottom-left of the list row (`prebottom`). Registry key: `layer-action-set-opacity`.

| | |
| --- | --- |
| **Signature** | `(menu?: Partial<Omit<MenuItemBottomOrExtra, 'click'>>) => MenuAction` |
| **Location** | `prebottom` |
| **Id** | `LIST_VIEW_MENU_ID.layer.setOpacity` (`set-opacity`) |
| **Auto** | List UI unless `.configDisabledOpacity()` |
| **Needs** | List node with opacity helpers |

```ts
list.addMenus([createMenuItemSetOpacity({ order: 0 })]);
// or disable the default:
createDatasetPartListViewUiComponentBuilder('Layer')
  .configDisabledOpacity()
  .build();
```

---

### `createMenuItemStyleEdit`

Opens the style editor (`style-control`) via `addComponent` for the current list layer.

| | |
| --- | --- |
| **Signature** | `(menu?: Partial<Omit<MenuItemBottomOrExtra, 'click'>>) => MenuAction` |
| **Id** | `LIST_VIEW_MENU_ID.layer.styleEdit` (`style-edit`) |
| **Default name** | `Edit style` |
| **Needs** | `ComponentManagementControl` + registry plugin; mapbox layer sibling |

```ts
list.addMenus([
  createMenuItemStyleEdit(),
  createMenuItemStyleEdit({ location: 'menu', name: 'Style…', order: 5 }),
]);
```

---

### `createMenuItemShowDetailInfoSource`

Opens an info popup (`layer-detail`) built from `getDatasetDetailInfo(layer)` (list + source + layer fields). If there are no fields, the click does nothing.

| | |
| --- | --- |
| **Signature** | `(menu?: Partial<Omit<MenuItemBottomOrExtra, 'click'>>) => MenuAction` |
| **Id** | `LIST_VIEW_MENU_ID.layer.info` (`info`) |
| **Default name** | `Info` |
| **Needs** | `ComponentManagementControl` |

```ts
list.addMenus([
  createMenuItemShowDetailInfoSource(),
  createMenuItemShowDetailInfoSource({ location: 'extra', order: 2 }),
]);
```

---

### `createMenuItemToBoundActionForList`

Fits the map to the layer bbox (`fitBounds`). Resolves bbox **at click time**:

1. `props.bbox` (if passed — fixed at menu creation)
2. nearest `bound` part — `getData()` ([Data helper](./with-helper-data.md#bound-createdatasetpartboundcomponent))
3. nearest `metadata` part — `metadata.bbox`
4. `layer.info.metadata.bbox` (if present)

| | |
| --- | --- |
| **Signature** | `(props?: { bbox?: BBox; name?: string }) => MenuAction` |
| **Location** | `extra` |
| **Id** | `LIST_VIEW_MENU_ID.layer.fillBound` (`fill-bound`) |
| **Default name** | `Fill bound` |
| **Auto** | `createGeoJsonDataset` / `createRasterUrlDataset` (with a bound part) |

```ts
// Static bbox (won’t change unless you replace the menu)
list.addMenus([
  createMenuItemToBoundActionForList({
    bbox: [105.83, 21.02, 105.85, 21.04],
    name: 'Zoom to layer',
  }),
]);

// Dynamic: omit bbox, keep a bound part, update later
import { createDatasetPartBoundComponent } from '@hungpvq/map-dataset';

const bound = createDatasetPartBoundComponent('Cities', [
  105.83, 21.02, 105.85, 21.04,
]);
dataset.add(bound);
list.addMenus([createMenuItemToBoundActionForList()]);

// External button / after reload
bound.setData([105.5, 20.5, 106.5, 21.5]);
```

---

### `createMenuItemIdentifyForList`

Per-layer Identify toggle (same click mode as [`IdentifyControl`](../module/IdentifyControl.md), but scoped to this layer’s identify sibling).

| | |
| --- | --- |
| **Signature** | `(options?: IdentifyForListMenuOptions) => MenuAction` |
| **Default location** | `extra` |
| **Id** | `LIST_VIEW_MENU_ID.layer.identify` (`identify-layer`) / `LIST_VIEW_MENU_ID.layer.identifyMenu` (`identify-layer-menu`) |
| **Component** | `layer-action-identify` (shared for `componentKey` and `componentMenuKey`; UI branches on `location`) |
| **Needs** | `IdentifyControl` mounted; nearest sibling `type === 'identify'` |
| **Auto** | `createGeoJsonDataset` (extra form) |

**Options:** `location?: MenuActionLocation` (`'extra' \| 'menu' \| 'bottom' \| 'prebottom'`), `name`, `icon`, `hidden`, `disabled`, `order`.

**Hidden** when `isIdentifyForListMenuHidden(ctx)` (no identify sibling, missing `mapId`, or `IdentifyControl` not registered on that map). Extra `options.hidden` is composed after that check.

**Active (primary):** while this list’s identify scope is on, the button/row uses `_active` / primary color. Only one layer is active at a time.

```ts
list.addMenus([
  createMenuItemIdentifyForList(), // title-row icon (`extra`)
  createMenuItemIdentifyForList({ location: 'menu' }), // ⋮ row
  createMenuItemIdentifyForList({ location: 'bottom' }), // bottom icon
  createMenuItemIdentifyForList({ location: 'prebottom' }), // prebottom icon
]);
```

Toggle on → opens IdentifyControl, starts map click, queries only that identify. Toggle off → clears scope and stops click mode. Global Identify toolbar clears the scope (all identify layers again).

---

### `createMenuItemToBoundActionForItem`

Identify / feature row action: fly to the feature geometry and highlight it.

| | |
| --- | --- |
| **Signature** | `() => MenuAction` |
| **Location** | `menu` |
| **Id** | `LIST_VIEW_MENU_ID.item.flyTo` (`fly-to`) |
| **Default name** | `Fly to` |
| **Click** | `fitBounds` on `value.geometry` + `highlight` (`key: 'identify'`) |
| **Needs** | Identify UI + `LayerHighlight`; `value` must look like a feature |

```ts
identify.addMenus([createMenuItemToBoundActionForItem()]);
```

---

### `createMenuItemShowDetailForItem`

Identify / feature row: open detail panel and highlight the feature.

| | |
| --- | --- |
| **Signature** | `(fields: FieldFeaturesDef) => MenuAction` |
| **Location** | `menu` |
| **Id** | `LIST_VIEW_MENU_ID.item.showDetail` (`show-detail`) |
| **Default name** | `Detail` |
| **Click** | `addComponent` → `layer-detail` + `highlight` (`key: 'detail'`) |
| **Needs** | `ComponentManagementControl`; `fields` define labels/keys for `value` |

```ts
identify.addMenus([
  createMenuItemShowDetailForItem([
    { text: 'Id', value: 'id' },
    { text: 'Name', value: 'name' },
    { trans: 'map.layer-control.field.geometry', value: 'geometry' },
  ]),
]);
```

`FieldFeaturesDef` items: `{ text? | trans?, value: string, inline? }`.

---

### `createMenuItemMoveUp` / `createMenuItemMoveDown`

Reorder the list row among siblings. Click dispatches `LIST_VIEW_MENU_ID.layer.moveUp` / `LIST_VIEW_MENU_ID.layer.moveDown` (handled by LayerControl).

| | Move up | Move down |
| --- | --- | --- |
| **Id** | `LIST_VIEW_MENU_ID.layer.moveUp` | `LIST_VIEW_MENU_ID.layer.moveDown` |
| **Order** | `20` | `21` |
| **Location** | `menu` | `menu` |

**Hidden when** (`isListViewReorderMenuHidden`):

- `menuContext.readonly` or `disabledMove`
- `layer.config.disabled_move` (`.configDisabledMove()`)

```ts
list.addMenus([
  createMenuItemMoveUp(),
  createMenuItemMoveDown({ name: 'Down' }),
]);
```

Auto-added by the list builder unless `.configDisabledMove()`.

---

### `createMenuItemAddToGroup`

Context-menu row with a custom submenu (`layer-action-add-to-group`): **New group** + existing groups.

| | |
| --- | --- |
| **Signature** | `(menu?: Partial<Omit<MenuItemBottomOrExtra, 'click'>>) => MenuAction` |
| **Location** | `menu` |
| **Id** | `LIST_VIEW_MENU_ID.layer.addToGroup` (`add-to-group`) |
| **Order** | `22` |
| **Needs** | Registry plugin for the submenu component |

**Hidden when**: `readonly`, `disabledCreateGroup`, or `.configDisabledAddToGroup()`.

Build submenu items yourself with:

```ts
import { createAddToGroupSubmenu, LIST_VIEW_MENU_ID } from '@hungpvq/map-dataset/menu';

const items = createAddToGroupSubmenu(
  [
    { id: 'g1', name: 'Group A' },
    { id: 'g2', name: 'Group B' },
  ],
  currentGroupId, // excluded from the list
);
// → "New group" + divider + other groups
```

---

### `createMenuItemExportGeo`

Export GeoJSON / KML / CSV / Shapefile from the ⋮ menu. Uses a custom submenu component. Full guide: [Export](./export.md).

| | |
| --- | --- |
| **Signature** | `(menu?: ExportGeoMenuOptions) => MenuAction` |
| **Location** | `menu` |
| **Id** | `LIST_VIEW_MENU_ID.layer.exportGeo` (`export-geo`) |
| **Order** | `23` |
| **Component** | `layer-action-export-geo` |

**Options**

| Field | Role |
| --- | --- |
| `formats` | Subset of `'geojson' \| 'kml' \| 'csv' \| 'shapefile'` |
| `filename` | `string` or `(layer) => string` |
| `getCollection` | Custom FeatureCollection (sync/async) |
| `hidden` / `disabled` / `order` / `name` / `icon` | Overlay |

**Hidden when**: `disabledExport`, `.configDisabledExport()`, or the layer has no GeoJSON / data-management export data.

```ts
list.addMenu(
  createMenuItemExportGeo({
    formats: ['geojson', 'kml'],
    filename: (layer) => layer.getName(),
  }),
);
// If you add it yourself, also .configDisabledExport() to avoid a duplicate default item
```

---

### `createMenuItemAttributeTable`

Opens the attribute table dialog. Full guide: [Attribute table](./attribute-table.md).

| | |
| --- | --- |
| **Signature** | `(menu?: AttributeTableMenuOptions) => MenuAction` |
| **Location** | `menu` |
| **Id** | `LIST_VIEW_MENU_ID.layer.attributeTable` (`attribute-table`) |
| **Order** | `24` |
| **Needs** | Registry + `ComponentManagementControl`; GeoJSON / data-management data |

**Options**: same overlays as other items, plus `columns` to limit / rename fields (array of `{ key, label }` / `'__geometry'`, or a `Record<key, label>`).

**Hidden when**: `disabledAttributeTable`, `.configDisabledAttributeTable()`, or no exportable GeoJSON data.

```ts
list.addMenu(
  createMenuItemAttributeTable({
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'pop', label: 'Population' },
      '__geometry',
    ],
  }),
);
```

---

### Constants

Use `LIST_VIEW_MENU_ID.layer.*` for list-row menus (`for: 'layer'`) and `LIST_VIEW_MENU_ID.item.*` for identify / attribute-table row menus (`for: 'item'`). Top-level keys (`addComponent`, `fitBounds`, `highlight`) are click-handler names, not menu ids.

```ts
LIST_VIEW_MENU_ID = {
  layer: {
    toggleShow: 'toggle-show',
    info: 'info',
    fillBound: 'fill-bound',
    styleEdit: 'style-edit',
    setOpacity: 'set-opacity',
    identify: 'identify-layer',
    identifyMenu: 'identify-layer-menu',
    moveUp: 'move-up',
    moveDown: 'move-down',
    addToGroup: 'add-to-group',
    addToExistingGroup: 'add-to-existing-group',
    exportGeo: 'export-geo',
    attributeTable: 'attribute-table',
  },
  item: {
    showDetail: 'show-detail',
    flyTo: 'fly-to',
  },
  addComponent: 'addComponent',
  fitBounds: 'fitBounds',
  highlight: 'highlight',
};

LIST_VIEW_MENU_COMPONENT_KEY = {
  addToGroup: 'layer-action-add-to-group',
  exportGeo: 'layer-action-export-geo',
  identify: 'layer-action-identify',
  toggleShow: 'layer-action-toggle-show',
  toggleShowButton: 'layer-action-toggle-show-button',
  setOpacity: 'layer-action-set-opacity',
  // … layerDetail, styleControl, legends, …
};
```

Move / add-to-group also hide when the list is `readonly` or LayerControl has `disabledMove` / `disabledCreateGroup`.

---

## Condition helpers

Used by LayerControl internally. Call them if you render menus yourself.

### `resolveMenuContextSource(source)`

`source` is `Record<string, any> | (() => Record | undefined) | undefined`. Nested functions are unwrapped.

```ts
resolveMenuContextSource(() => ({ role: 'admin' })); // { role: 'admin' }
resolveMenuContextSource(undefined); // {}
```

### `createMenuConditionContext(layer, { mapId, context })`

`context` is an array of sources, merged left → right. `ctx.context` is a getter (fresh on each read).

```ts
import { createMenuConditionContext, isMenuItemHidden, isMenuItemDisabled, resolveMenuCondition } from '@hungpvq/map-dataset/menu';

const ctx = createMenuConditionContext(layer, {
  mapId,
  context: [
    { readonly: false, disabledMove: false },
    () => ({ role: store.role }),
  ],
});

menus.filter((m) => !isMenuItemHidden(m, ctx));
if (isMenuItemDisabled(menu, ctx)) return;

resolveMenuCondition(menu.hidden, ctx); // boolean
```

### Vue

| Function | Role |
| --- | --- |
| `provideMenuConditionContext(source)` | Merges with parent inject |
| `useMenuConditionSource()` | Raw source (object or getter) |
| `useMenuConditionContext()` | Resolved `Record<string, any>` |

### React

| API | Role |
| --- | --- |
| `<MenuConditionProvider value={source}>` | Merges with parent |
| `useMenuConditionContext()` | Resolved object |

### `isListViewReorderMenuHidden(menuId, ctx)`

```ts
isListViewReorderMenuHidden(LIST_VIEW_MENU_ID.layer.moveUp, ctx);
isListViewReorderMenuHidden(LIST_VIEW_MENU_ID.layer.addToGroup, ctx);
```

True when `context.readonly`, `disabledMove` / `disabledCreateGroup`, or `layer.config.disabled_move` / `disabled_add_to_group`.

---

## Custom context-menu component

`setComponentMenuKey` renders your registry component instead of a label. The component owns submenu open/close.

```ts
createMenuBuilder()
  .item()
  .setLocation('menu')
  .setName('Sample')
  .setIcon(mdiStar)
  .setComponentMenuKey('sample-layer-menu')
  .build();
```

Register once (same as `createDatasetRegistryPlugin()` does for add-to-group). Prefer `registerComponentForMap` + `onMapLoaded` for page-only overrides — see [UniversalRegistry components](/map/core/registry-components).

```ts
import { UniversalRegistry } from '@hungpvq/vue-map-core';
import SampleCustomMenu from './sample-custom-menu.vue';

UniversalRegistry.registerComponent('sample-layer-menu', SampleCustomMenu);
// or per map:
// UniversalRegistry.registerComponentForMap(mapId, 'sample-layer-menu', SampleCustomMenu);
```

**Vue component**

```vue
<script setup lang="ts">
import type { IListViewUI } from '@hungpvq/map-dataset';
import type { MenuAction } from '@hungpvq/map-dataset/menu';
import { ref } from 'vue';

const props = defineProps<{
  item: MenuAction<IListViewUI>;
  data?: IListViewUI;
  mapId?: string;
}>();
const emit = defineEmits<{ close: [] }>();
const open = ref(false);

function onDone() {
  emit('close');
}
</script>

<template>
  <li class="layer-context-menu__item" @click.stop="open = !open">
    <span>{{ 'name' in item ? item.name : '' }}</span>
    <ul v-if="open" class="layer-context-menu layer-context-menu--submenu">
      <li class="layer-context-menu__item" @click.stop="onDone">Done</li>
    </ul>
  </li>
</template>
```

**React:** same props plus `onClose?: () => void` instead of `emit('close')`.

| Prop | Vue | React |
| --- | --- | --- |
| Menu definition | `item` | `item` |
| Layer | `data` | `data` |
| Map id | `mapId` | `mapId` |
| Groups | `getGroups` | `getGroups` |
| Close popup | `emit('close')` | `onClose()` |

Parent row click should toggle a submenu, not close the popup. Call close only after a real action.

`isMenuItemCustomComponent(menu)` — true when `componentMenuKey` is set.

Built-in add-to-group: `LIST_VIEW_MENU_COMPONENT_KEY.addToGroup` (`'layer-action-add-to-group'`).

```ts
import { createAddToGroupSubmenu, LIST_VIEW_MENU_ID } from '@hungpvq/map-dataset/menu';

const items = createAddToGroupSubmenu(
  [
    { id: 'g1', name: 'Group A' },
    { id: 'g2', name: 'Group B' },
  ],
  currentGroupId, // excluded
);
// → "New group" + divider + existing groups
```

---

## Runtime API on a dataset that has menus

From `createWithMenuHelper()` (already mixed into list / identify builders):

```ts
list.addMenu(menu);
list.addMenus([a, b]);
list.getMenus();
list.getMenu('admin-only');
list.hasMenu('admin-only');
list.updateMenu('admin-only', (m) => ({ ...m, name: 'Admins' }));
list.removeMenu('admin-only');
```

Duplicate `id` is ignored on add.

`createMenuItem(object)` only wraps a raw extra/bottom item. Prefer `createMenuBuilder()`.

---

## `handleMenuAction`

LayerControl already runs this on click. Use it only if you render a custom list:

```ts
import { handleMenuAction } from '@hungpvq/map-dataset/menu';

handleMenuAction(action, {
  layer: item,
  mapId,
  value: item,
  event,
});
```

Disabled items should not call this (the default UI already skips them).
