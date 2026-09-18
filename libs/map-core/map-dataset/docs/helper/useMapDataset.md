# useMapDataset

Store for datasets on one map. Prefer calling with a real map id, or call with no id then `setMapId(map.id)` from `@mapLoaded` / `onMapLoaded`.

**Contract:** never allocate under empty `mapId` (`isUsableMapId`). Vue defers store creation; React uses an inert stand-in until `setMapId`.

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
