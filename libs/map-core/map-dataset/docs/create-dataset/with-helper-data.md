# Data helper

In-memory payload on a node (`getData` / `setData`). Used by source, layer, highlight, bound, and menu factories.

**Events:** none.

```ts
import { createWithDataHelper, createDatasetLeaf } from '@hungpvq/vue-map-dataset';

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
import {
  createDatasetPartBoundComponent,
  createMenuItemToBoundActionForList,
  createRootDataset,
  createDatasetPartListViewUiComponent,
} from '@hungpvq/vue-map-dataset';

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

Stores default menus that list, identify, and the attribute table share. Data is `{ for, key, menu }[]`. `key` matches `menu.id` (local menus with the same id override). Prefer the builder.

- `for: 'layer'` — LayerControl row (merged with that list / list-item's own menus)
- `for: 'item'` — identify result rows and attribute table rows (merged with the identify node's menus)

Add the menu part to the same dataset tree. List, identify, and the table find it with `findFirstLeafByType(..., 'menu')`.

```ts
import {
  createRootDataset,
  createDatasetPartMenuComponent,
  createDatasetPartMenuComponentBuilder,
  createDatasetPartListViewUiComponentBuilder,
  createDatasetPartIdentifyComponentBuilder,
  createMenuItemShowDetailInfoSource,
  createMenuItemShowDetailForItem,
  createMenuItemToBoundActionForItem,
  LIST_VIEW_MENU_ID,
} from '@hungpvq/vue-map-dataset';

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

### Builder methods

| Method | Example | Effect |
| --- | --- | --- |
| `addMenu` | `.addMenu({ for: 'layer', key: LIST_VIEW_MENU_ID.layer.info, menu })` | One entry |
| `addMenus` | `.addMenus([{ for: 'item', key, menu }])` | Several entries |
| `addLayerMenu` | `.addLayerMenu(menu, LIST_VIEW_MENU_ID.layer.info)` | `for: 'layer'` (`key` defaults to `menu.id`) |
| `addItemMenu` | `.addItemMenu(menu)` | `for: 'item'` |
| `addLayerMenus` / `addItemMenus` | `.addLayerMenus([a, b])` | Several menus for that `for` |

`getResolvedMenus(dataset, 'layer' | 'item')` is what the UI calls. It finds the nearest `menu` part with `findFirstLeafByType`, and for `item` finds identify the same way.

