# Identify

Click / box-select features. Attach menus with `createMenuBuilder` (see [Menus](./with-helper-menu.md)).

Mount [`IdentifyControl`](../module/IdentifyControl.md) (or [`IdentifyShowFirstControl`](../module/IdentifyShowFirstControl.md)) on the map. Dialogs from identify menus need [`ComponentManagementControl`](../module/ComponentManagementControl.md).

**Events:** none on the identify node. Menu `setClick` receives `{ layer, mapId, value, event, meta, context }` (`value` is the feature).

Each hit is a flat `{ id, name, data }` feature under an identify node (`IdentifyMultiResult`).

## Config

```ts
{
  field_id?: string;   // default 'id'
  field_name?: string; // default 'name'
  fields?: { text: string; value: string }[];
  preferResultControl?: boolean; // skip auto detail/table → result popup
}
```

## Factories

```ts
import {
  createIdentifyMapboxComponent,
  createIdentifyMapboxMergedComponent,
  createDatasetPartIdentifyComponentBuilder,
  createMenuItemShowDetailForItem,
  createMenuItemToBoundActionForItem,
} from '@hungpvq/vue-map-dataset';

const identify = createIdentifyMapboxComponent('identify', {
  field_id: 'id',
  field_name: 'name',
});

identify.addMenus([
  createMenuItemToBoundActionForItem(),
  createMenuItemShowDetailForItem([
    { text: 'Id', value: 'id' },
    { text: 'Name', value: 'name' },
  ]),
]);

// Several identify nodes share one query
const identifyMerged = createIdentifyMapboxMergedComponent(
  'merge identify',
  { field_id: 'id', field_name: 'name' },
  'name-group-merge',
);
```

## Builder

```ts
const identify = createDatasetPartIdentifyComponentBuilder('My identify')
  .configFieldId('id')
  .configFieldName('name')
  .setConfigFields([
    { text: 'Id', value: 'id' },
    { text: 'Name', value: 'name' },
  ])
  .setGroup({ id: 'g1', name: 'Group' })
  .addMenus([createMenuItemToBoundActionForItem()])
  .build();

createDatasetPartIdentifyComponentBuilder('merged').isUseMerge('mapbox-group').build();
```

| Method | Role |
| --- | --- |
| `configFieldId` / `configFieldName` | Property names on the feature |
| `setConfigFields` | Columns for show-detail |
| `setGroup` | Group in the identify panel |
| `isUseMerge(id?)` | Merged query (`id` default `'mapbox-group'`) |
| `preferResultControl(value?)` | Skip auto detail/table for this node; use result popup (`true` if omitted) |
| `addMenu` / `addMenus` | Actions on each result |

```ts
createDatasetPartIdentifyComponentBuilder('API identify')
  .setConfigFields([{ text: 'Id', value: 'id' }])
  .preferResultControl()
  .build();
```

## Presentation (`singleLayer` / `preferResultControl`)

IdentifyControl passes `singleLayer: true` when the layer filter (InputSelect / layer-item) scopes to one identify node:

| Mode | Typical UI |
| --- | --- |
| Single layer | Show-detail (1 feature) or attribute table; result panel only if neither applies |
| All layers | Identify result panel with grouped hits |
| `preferResultControl` (control **or** identify node) | Always result panel (skip auto detail/table even if those menus exist) |

Per identify (builder):

```ts
createDatasetPartIdentifyComponentBuilder('My layer')
  .preferResultControl()
  .build();
```

Control-wide:

```vue
<IdentifyControl prefer-result-control />
```

```tsx
<IdentifyControl preferResultControl />
```

## Async detail API (`getList`)

After map hit-test, override `getList` to load / enrich properties (e.g. REST call). Return flat objects used as feature `data`.

```ts
const identify = createDatasetPartIdentifyComponentBuilder('API identify')
  .setConfigFields([
    { text: 'Id', value: 'id' },
    { text: 'Name', value: 'name' },
    { text: 'Status', value: 'status' },
  ])
  .build();

identify.getList = async (_mapId, features) => {
  await new Promise((r) => setTimeout(r, 1000)); // fake latency
  return features.map((feature) => ({
    ...(feature.properties || {}),
    id: feature.properties?.id ?? feature.id,
    status: 'from-api',
    geometry: feature.geometry,
  }));
};
```

While this runs, [`IdentifyControl`](../module/IdentifyControl.md) shows **loading on the Identify toolbar button** (not by opening the result panel).

## Merged query API (`getMergedFeatures`)

With `.isUseMerge(groupId)`, several identify nodes share one query. Override `getMergedFeatures` on those nodes for a single batched API:

```ts
const groupId = 'my-api-merge';
const a = createDatasetPartIdentifyComponentBuilder('A').isUseMerge(groupId).build();
const b = createDatasetPartIdentifyComponentBuilder('B').isUseMerge(groupId).build();

const original = a.getMergedFeatures.bind(a);
const withApi = async (
  identifies: Parameters<typeof original>[0],
  payload: Parameters<typeof original>[1],
) => {
  await new Promise((r) => setTimeout(r, 1000));
  const rows = await original(identifies, payload);
  return rows.map((row: { feature: { data?: Record<string, unknown> } }) => ({
    ...row,
    feature: {
      ...row.feature,
      data: { ...row.feature.data, status: 'from-api-merge' },
    },
  }));
};
a.getMergedFeatures = withApi;
b.getMergedFeatures = withApi;
```

## Tree example

```ts
const dataset = createRootDataset('Cities');
dataset.add(source);
dataset.add(list);
dataset.add(layer);
dataset.add(identify);
dataset.add(createDatasetPartHighlightComponent());
```
