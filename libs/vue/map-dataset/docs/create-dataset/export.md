# Export GeoJSON

Download a GeoJSON dataset as **GeoJSON**, **KML**, **CSV**, or **Shapefile (zip)**.

The **Export** item is added to the list ⋮ menu when the layer has a GeoJSON source or a data-management sibling. Raster / vector-tile layers hide it.

Needs `createDatasetRegistryPlugin()` so the submenu renders.

## Formats

| Format | File | Notes |
| --- | --- | --- |
| GeoJSON | `.geojson` | Always available |
| CSV | `.csv` | Properties + `geometry` JSON column |
| KML | `.kml` | Needs optional peer `tokml` |
| Shapefile | `.zip` | Needs optional peer `@mapbox/shp-write` |

Data comes from `data-management.list()` when that node exists; otherwise from the GeoJSON source (`getData()`, or a URL that is fetched).

## Built-in menu

```ts
createDatasetPartListViewUiComponentBuilder('Cities')
  .setColor('#ff6b6b')
  .build();
```

Turn off: `.configDisabledExport()`, or `menuContext: { disabledExport: true }`.

Custom formats / filename:

```ts
import { createMenuItemExportGeo } from '@hungpvq/vue-map-dataset';

list.addMenu(
  createMenuItemExportGeo({
    formats: ['geojson', 'kml'],
    filename: (layer) => layer.getName(),
  }),
);
```

If you add it yourself, also call `.configDisabledExport()` so the default item is not duplicated.

## Call without a menu

```ts
import { exportDatasetGeo, getDatasetFeatureCollection } from '@hungpvq/vue-map-dataset';

const fc = await getDatasetFeatureCollection(list);
await exportDatasetGeo(list, 'kml');
await exportDatasetGeo(list, 'shapefile', { filename: 'cities' });
```

**Events:** none. The browser download starts after convert.

## Vue / React

No extra control. Mount `LayerControl` + `createDatasetRegistryPlugin()`. KML / Shapefile need:

```bash
npm install tokml @mapbox/shp-write
```
