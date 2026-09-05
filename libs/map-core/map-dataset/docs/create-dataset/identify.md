# Identify

Click / box-select features. Attach menus with `createMenuBuilder` (see [Menus](./with-helper-menu.md)).

Mount [`IdentifyControl`](../module/IdentifyControl.md) (or [`IdentifyShowFirstControl`](../module/IdentifyShowFirstControl.md)) on the map. Dialogs from identify menus need [`ComponentManagementControl`](../module/ComponentManagementControl.md).

**Events:** none on the identify node. Menu `setClick` receives `{ layer, mapId, value, event, meta, context }` (`value` is the feature).

## Config

```ts
{
  field_id?: string;   // default 'id'
  field_name?: string; // default 'name'
  fields?: { text: string; value: string }[];
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
| `addMenu` / `addMenus` | Actions on each result |

## Tree example

```ts
const dataset = createRootDataset('Cities');
dataset.add(source);
dataset.add(list);
dataset.add(layer);
dataset.add(identify);
dataset.add(createDatasetPartHighlightComponent());
```
