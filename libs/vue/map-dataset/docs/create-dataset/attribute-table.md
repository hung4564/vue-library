# Attribute table

Tabular view of GeoJSON feature properties. The **Attribute table** item is added to the list ⋮ menu when the layer has a GeoJSON source or a data-management sibling. Raster / vector-tile layers hide it.

Click a row to `fitBounds` that feature and highlight it. Closing the dialog clears the highlight if it was opened from this table.

Needs `createDatasetRegistryPlugin()` and [`ComponentManagementControl`](../module/ComponentManagementControl.md) so the dialog can open. Mount [`LayerHighlight`](../module/LayerHighlight.md) if you want the selected row painted on the map.

## Built-in menu

```ts
createDatasetPartListViewUiComponentBuilder('Cities')
  .setColor('#ff6b6b')
  .build();
```

Turn off: `.configDisabledAttributeTable()`, or `menuContext: { disabledAttributeTable: true }`.

Custom label / icon:

```ts
import { createMenuItemAttributeTable } from '@hungpvq/vue-map-dataset';

list.addMenu(
  createMenuItemAttributeTable({
    name: 'Table',
  }),
);
```

If you add it yourself, also call `.configDisabledAttributeTable()` so the default item is not duplicated.

## Call without a menu

```ts
import {
  buildAttributeTable,
  filterAttributeTableRows,
  getDatasetFeatureCollection,
} from '@hungpvq/vue-map-dataset';

const fc = await getDatasetFeatureCollection(list);
if (!fc) return;
const { columns, rows } = buildAttributeTable(fc);
const visible = filterAttributeTableRows(rows, 'hanoi');
```

Data comes from `data-management.list()` when that node exists; otherwise from the GeoJSON source (`getData()`, or a URL that is fetched). The last column is **Geometry** (`Point`, `Polygon`, …).

**Events:** the dialog emits Vue `close` / React `onClose` when dismissed. The list node itself has no extra events.

## Vue / React

No extra control. Mount `LayerControl` + `ComponentManagementControl` + `createDatasetRegistryPlugin()`.
