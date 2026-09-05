# useMapDataset

Store for datasets on one map. Call it with the map id from `@map-loaded`.

## Vue

```ts
const {
  addDataset,
  removeDataset,
  removeComponent,
  getDatasets,
  getDatasetIds,
  getAllComponentsByType,
  setMapId,
} = useMapDataset(mapId);
```

| Method | Role |
| --- | --- |
| `addDataset(dataset)` | Add tree to the map (respects `dependsOn`) |
| `removeDataset(dataset)` | Remove tree from the map |
| `removeComponent(node)` | Remove one node (e.g. a list row) |
| `getDatasets()` | Root datasets |
| `getDatasetIds()` | `Ref<string[]>` of root ids |
| `getAllComponentsByType<T>(type)` | e.g. `'list'`, `'identify'` |
| `setMapId(id)` | Bind after mount |

```ts
function onMapLoaded(map: MapSimple) {
  const { addDataset } = useMapDataset(map.id);
  addDataset(createRootDataset('Sample'));
}
```

## React

Same methods. The hook also returns `datasetVersion` (number) so list UIs re-render after add/remove.

```ts
const { addDataset, datasetVersion } = useMapDataset(map.id);
```

**Events:** none. Subscribe to list-node events (`toggleShow`, `changeOpacity`) — see [Events](../create-dataset/with-helper-event.md).
