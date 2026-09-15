# Data helper

In-memory payload on a node (`getData` / `setData`). Used by source, layer, highlight, bound, and menu factories.

**Events:** none.

```ts
import {
  createWithDataHelper,
  createDatasetLeaf,
} from '@hungpvq/map-dataset';

const data = createWithDataHelper({ count: 0 });

const leaf = {
  ...createDatasetLeaf('counter'),
  type: 'counter',
  ...data,
};

leaf.getData(); // { count: 0 }
leaf.setData({ count: 1 });
```

GeoJSON source wraps this: `source.getData()` is the FeatureCollection; `source.updateData(map, next)` also updates the MapLibre source.

## Bound (`createDatasetPartBoundComponent`)

Stores a `BBox` directly in data. Invalid bbox throws.

```ts
import { createDatasetPartBoundComponent, createRootDataset, createDatasetPartListViewUiComponent } from '@hungpvq/map-dataset';
import { createMenuItemToBoundActionForList } from '@hungpvq/map-dataset/menu';

const dataset = createRootDataset('Cities');
const bound = createDatasetPartBoundComponent('Cities', [
  105.83, 21.02, 105.85, 21.04,
]);
const list = createDatasetPartListViewUiComponent('Cities');

// Do not pass `bbox` into the menu — Fill bound reads from the bound part at click time
list.addMenus([createMenuItemToBoundActionForList()]);

dataset.add(bound);
dataset.add(list);

// Later (external button, after data reload, …): update bbox
bound.setData([105.5, 20.5, 106.5, 21.5]);
// Next Fill bound click uses the new value via bound.getData()
```

`createMenuItemToBoundActionForList` resolve order:

1. `bbox` argument (if passed — freezes the value at menu creation)
2. nearest `bound` part (`getData()`)
3. nearest `metadata` part (`metadata.bbox`)
4. `info.metadata.bbox` on the list node

## Menu (`createDatasetPartMenuComponent`)

Stores default menus that list, identify, and the attribute table share. Data is `{ for, key, menu, byControl? }[]`. `key` matches `menu.id` (local menus with the same id override). Prefer the builder.

- `for: 'layer'` — LayerControl row (merged with that list / list-item's own menus)
- `for: 'item'` — identify result rows and attribute table rows (merged with the identify node's menus)
- `byControl` (optional) — per-host placement (`location` / `hidden`) keyed by `MENU_CONTROL_ID` (`layer-control`, `layer-detail`, `identify`, `attribute-table`). Hosts inject `context.control`; `partitionMenuActions` / `DatasetMenus` apply overrides at render. Same field can live on the `menu` itself (`setByControl`).

Add the menu part to the same dataset tree. List, identify, and the table find it with `findPartByType(..., 'menu')`.

```ts
import { createRootDataset, createDatasetPartListViewUiComponentBuilder } from '@hungpvq/map-dataset';
import {
  createDatasetPartMenuComponent,
  createDatasetPartMenuComponentBuilder,
  createMenuItemShowDetailInfoSource,
  createMenuItemShowDetailForItem,
  createMenuItemToBoundActionForItem,
  LIST_VIEW_MENU_ID,
} from '@hungpvq/map-dataset/menu';
import { createDatasetPartIdentifyComponentBuilder } from '@hungpvq/map-dataset/identify';

const dataset = createRootDataset('Cities');

// Shortcut
const simple = createDatasetPartMenuComponent('default menus', [
  {
    for: 'layer',
    key: LIST_VIEW_MENU_ID.layer.info,
    menu: createMenuItemShowDetailInfoSource(),
  },
]);

const menus = createDatasetPartMenuComponentBuilder('default menus')
  .addLayerMenu(
    createMenuItemShowDetailInfoSource(),
    LIST_VIEW_MENU_ID.layer.info,
  )
  .addItemMenu(
    createMenuItemShowDetailForItem([{ text: 'Name', value: 'name' }]),
    LIST_VIEW_MENU_ID.item.showDetail,
  )
  .addItemMenu(
    createMenuItemToBoundActionForItem(),
    LIST_VIEW_MENU_ID.item.flyTo,
  )
  .build();

const list = createDatasetPartListViewUiComponentBuilder('Cities').build();
const identify = createDatasetPartIdentifyComponentBuilder('Cities').build();

dataset.add(menus);
dataset.add(list);
dataset.add(identify);

// Later: replace defaults
menus.setData([
  ...menus.getData().filter((entry) => entry.for !== 'layer'),
  {
    for: 'layer',
    key: LIST_VIEW_MENU_ID.layer.info,
    menu: createMenuItemShowDetailInfoSource(),
  },
]);
```

### Example: `byControl` (LayerDetail vs list / identify)

Same menu definition; placement changes with the host. Built-ins already follow this pattern — copy when you add custom actions.

| Control (`MENU_CONTROL_ID`) | Fill bound / Fly to | Detail / Info |
| --- | --- | --- |
| `layer-control` / `identify` / `attribute-table` | `extra` (default) | shown (`menu` / `extra`) |
| `layer-detail` | `title` (header `after-title`) | `hidden: true` |

```ts
import { createRootDataset, createDatasetPartListViewUiComponentBuilder } from '@hungpvq/map-dataset';
import { createDatasetPartIdentifyComponentBuilder } from '@hungpvq/map-dataset/identify';
import {
  MENU_CONTROL_ID,
  createDatasetPartMenuComponentBuilder,
  createMenuBuilder,
  createMenuItemShowDetailForItem,
  createMenuItemToBoundActionForItem,
  createMenuItemToBoundActionForList,
  LIST_VIEW_MENU_ID,
} from '@hungpvq/map-dataset/menu';
import { mdiStar } from '@mdi/js';

const dataset = createRootDataset('Places');

// Built-ins already set byControl for LayerDetail — add as-is:
const menus = createDatasetPartMenuComponentBuilder('shared menus')
  .addLayerMenu(
    createMenuItemToBoundActionForList(), // extra → title on layer-detail
    LIST_VIEW_MENU_ID.layer.fillBound,
  )
  .addItemMenu(
    createMenuItemToBoundActionForItem(), // extra → title on layer-detail
    LIST_VIEW_MENU_ID.item.flyTo,
  )
  .addItemMenu(
    createMenuItemShowDetailForItem([{ text: 'Name', value: 'name' }]), // hidden on layer-detail
    LIST_VIEW_MENU_ID.item.showDetail,
  )
  // Custom: pin on LayerDetail title; icon on LayerControl / Identify rows
  .addMenu({
    for: 'layer',
    key: 'favorite',
    menu: createMenuBuilder()
      .item()
      .setId('favorite')
      .setLocation('extra')
      .setName('Favorite')
      .setIcon(mdiStar)
      .setByControl({
        [MENU_CONTROL_ID.layerDetail]: { location: 'title' },
      })
      .setClick(({ layer }) => {
        /* … */
      })
      .build(),
  })
  // Equivalent: put byControl on the entry (merged onto menu.byControl)
  .addMenu({
    for: 'item',
    key: 'admin-only-on-detail',
    menu: createMenuBuilder()
      .item()
      .setId('admin-only-on-detail')
      .setLocation('menu')
      .setName('Admin')
      .setIcon(mdiStar)
      .setClick(() => undefined)
      .build(),
    byControl: {
      [MENU_CONTROL_ID.layerDetail]: { hidden: true },
    },
  })
  .build();

dataset.add(menus);
dataset.add(createDatasetPartListViewUiComponentBuilder('Places').build());
dataset.add(createDatasetPartIdentifyComponentBuilder('Places').build());
```

UI hosts inject `context.control` automatically (`LayerControl`, `LayerDetail`, `IdentifyResultControl`, `AttributeTable`). No extra props required for `byControl` to apply.

Live demo: `#/dataset-menu` → layer **byControl · LayerDetail title**.

### Builder methods

| Method | Example | Effect |
| --- | --- | --- |
| `addMenu` | `.addMenu({ for: 'layer', key, menu, byControl? })` | One entry (optional entry-level `byControl`) |
| `addMenus` | `.addMenus([{ for: 'item', key, menu }])` | Several entries |
| `addLayerMenu` | `.addLayerMenu(menu, LIST_VIEW_MENU_ID.layer.info)` | `for: 'layer'` (`key` defaults to `menu.id`) |
| `addItemMenu` | `.addItemMenu(menu)` | `for: 'item'` |
| `addLayerMenus` / `addItemMenus` | `.addLayerMenus([a, b])` | Several menus for that `for` |

`getResolvedMenus(dataset, 'layer' | 'item')` is what the UI calls. It finds the nearest `menu` part with `findPartByType`, and for `item` finds identify the same way. Placement (`byControl`) is applied later at render inside `partitionMenuActions` / `DatasetMenus`.

