# Attribute table

Tabular view of GeoJSON feature properties. The **Attribute table** item is added to the list ⋮ menu when the layer has a GeoJSON source or a data-management sibling. Raster / vector-tile layers hide it.

Select rows (checkbox or click) to highlight them. **Zoom to selection** is off by default — turn it on to `fitBounds` when the selection changes. **Export** is the same format menu as the layer ⋮ **Export** item (GeoJSON, KML, CSV, Shapefile) and uses the same `exportDatasetGeo` / `createExportGeoSubmenu` path. It downloads the currently visible rows (search + All / Selected filter).

Needs `createDatasetRegistryPlugin()` and [`ComponentManagementControl`](../module/ComponentManagementControl.md) so the dialog can open. Mount [`LayerHighlight`](../module/LayerHighlight.md) if you want the selected row painted on the map.

## Built-in menu

```ts
createDatasetPartListViewUiComponentBuilder('Cities')
  .setColor('#ff6b6b')
  .build();
```

Turn off: `.configDisabledAttributeTable()`, or `menuContext: { disabledAttributeTable: true }`.

## Columns

Pass `columns` to limit fields and/or map labels. Omit it to show every property plus **Geometry**.

```ts
import { createMenuItemAttributeTable } from '@hungpvq/vue-map-dataset';

// Limit + labels
list.addMenu(
  createMenuItemAttributeTable({
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'pop', label: 'Population' },
      '__geometry',
    ],
  }),
);

// Same thing as a map of key → label (order is object key order)
list.addMenu(
  createMenuItemAttributeTable({
    columns: { name: 'Name', pop: 'Population' },
  }),
);
```

If you add the menu yourself, also call `.configDisabledAttributeTable()` so the default item is not duplicated.

## Call without a menu

```ts
import {
  attributeTableRowsToFeatureCollection,
  buildAttributeTable,
  exportAttributeTableRows,
  exportDatasetGeo,
  filterAttributeTableRows,
  getDatasetFeatureCollection,
} from '@hungpvq/vue-map-dataset';

const fc = await getDatasetFeatureCollection(list);
if (!fc) return;
const { columns, rows } = buildAttributeTable(fc, {
  name: 'Name',
  pop: 'Population',
});
const visible = filterAttributeTableRows(rows, 'hanoi');
await exportAttributeTableRows(visible, 'kml', 'cities-table');
await exportDatasetGeo(list, 'shapefile', {
  collection: attributeTableRowsToFeatureCollection(visible),
  filename: 'cities-table',
});
```

Data comes from `data-management.list()` when that node exists; otherwise from the GeoJSON source (`getData()`, or a URL that is fetched).

**Events:** the dialog emits Vue `close` / React `onClose` when dismissed. The list node itself has no extra events.

## Vue / React

No extra control. Mount `LayerControl` + `ComponentManagementControl` + `createDatasetRegistryPlugin()`.
