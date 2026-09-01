# Menus

List UI and identify nodes expose actions in four places. Build items with `createMenuBuilder()`. Click handlers receive `{ layer, mapId, value, event, meta, context }` — not `(layer, mapId)`.

| `location` | Where it renders |
| --- | --- |
| `extra` | Icon buttons on the layer title row |
| `prebottom` | Left of the bottom row (opacity lives here by default) |
| `bottom` | Right of the bottom row |
| `menu` | Context menu (⋮) |

---

## End-to-end: conditions from app state

Define menus once on the dataset. Evaluate `hidden` / `disabled` at **render** with `menuContext` (Pinia, React state, …).

### 1. Menus on the list

```ts
import {
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
  createMenuBuilder,
} from '@hungpvq/vue-map-dataset';
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
import { LayerControl, useMapDataset } from '@hungpvq/vue-map-dataset';
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
import { LayerControl, useMapDataset } from '@hungpvq/react-map-dataset';
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
import { createMenuBuilder } from '@hungpvq/vue-map-dataset';

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
import { createMenuClickBuilder } from '@hungpvq/vue-map-dataset';

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

Built-in keys used by the library: `fitBounds`, `highlight`, `addComponent`, plus list ids in `LIST_VIEW_MENU_ID`.

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

All return a `MenuAction`. Optional last argument overlays fields (`order`, `name`, …).

```ts
import {
  createMenuItemToggleShow,
  createMenuItemSetOpacity,
  createMenuItemStyleEdit,
  createMenuItemShowDetailInfoSource,
  createMenuItemToBoundActionForList,
  createMenuItemShowDetailForItem,
  createMenuItemToBoundActionForItem,
  createMenuItemMoveUp,
  createMenuItemMoveDown,
  createMenuItemAddToGroup,
  createMenuItemExportGeo,
  createMenuItemAttributeTable,
} from '@hungpvq/vue-map-dataset';

list.addMenus([
  createMenuItemToggleShow(),
  createMenuItemStyleEdit(),
  createMenuItemShowDetailInfoSource(),
  createMenuItemToBoundActionForList({
    bbox: [105.83, 21.02, 105.85, 21.04],
  }),
]);

identify.addMenus([
  createMenuItemToBoundActionForItem(),
  createMenuItemShowDetailForItem([
    { text: 'Id', value: 'id' },
    { text: 'Name', value: 'name' },
  ]),
]);
```

| Function | Default location | When it is added for you |
| --- | --- | --- |
| `createMenuItemToggleShow()` | `extra` | — (add yourself) |
| `createMenuItemSetOpacity()` | `prebottom` | List UI unless `configDisabledOpacity()` |
| `createMenuItemStyleEdit()` | extra | — |
| `createMenuItemShowDetailInfoSource()` | extra | — |
| `createMenuItemToBoundActionForList({ bbox? })` | extra | — |
| `createMenuItemShowDetailForItem(fields)` | `menu` | Identify |
| `createMenuItemToBoundActionForItem()` | `menu` | Identify |
| `createMenuItemMoveUp()` / `MoveDown()` | `menu` | List UI unless `configDisabledMove()` |
| `createMenuItemAddToGroup()` | `menu` | List UI unless `configDisabledAddToGroup()` |
| `createMenuItemExportGeo()` | `menu` | List UI unless `configDisabledExport()`; hidden if the layer is not GeoJSON |
| `createMenuItemAttributeTable()` | `menu` | List UI unless `configDisabledAttributeTable()`; hidden if the layer is not GeoJSON. Optional `columns` to limit / rename fields. |

Move / add-to-group also hide when the list is `readonly` or LayerControl has `disabledMove` / `disabledCreateGroup`. Per-layer: `configDisabledMove()`, `configDisabledAddToGroup()`.

Export submenu: GeoJSON, KML, CSV, Shapefile. See [Export](./export.md). Attribute table: see [Attribute table](./attribute-table.md).

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
import {
  createMenuConditionContext,
  isMenuItemHidden,
  isMenuItemDisabled,
  resolveMenuCondition,
} from '@hungpvq/map-dataset';

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
isListViewReorderMenuHidden(LIST_VIEW_MENU_ID.moveUp, ctx);
isListViewReorderMenuHidden(LIST_VIEW_MENU_ID.addToGroup, ctx);
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

Register once (same as `createDatasetRegistryPlugin()` does for add-to-group):

```ts
import { UniversalRegistry } from '@hungpvq/vue-map-core';
import SampleCustomMenu from './sample-custom-menu.vue';

UniversalRegistry.registerComponent('sample-layer-menu', SampleCustomMenu);
```

**Vue component**

```vue
<script setup lang="ts">
import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';
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
import {
  createAddToGroupSubmenu,
  LIST_VIEW_MENU_ID,
} from '@hungpvq/map-dataset';

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
import { handleMenuAction } from '@hungpvq/map-dataset';

handleMenuAction(action, {
  layer: item,
  mapId,
  value: item,
  event,
});
```

Disabled items should not call this (the default UI already skips them).
