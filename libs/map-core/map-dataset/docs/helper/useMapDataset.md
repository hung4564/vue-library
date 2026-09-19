# useMapDataset

Store for datasets on one map. Prefer calling with a real map id, or call with no id then `setMapId(map.id)` from `@mapLoaded` / `onMapLoaded`.

`useMapDataset` may also be called **imperatively** from `@mapLoaded` / `onMapLoaded` (no Vue effect scope). In that case it does not register `watch` / `onScopeDispose` or long-lived store listeners — only UI hosts created in `setup()` subscribe via `datasetVersion`.

## Reactivity (Vue + React)

The domain bag (`MapDatasetStore` on `map:core[mapId].dataset`) is a **plain object** — not a Vue `ref` / React state. Mutations go through `DatasetService` + `notifyMapDatasetStore(store)` (bumps `store.version` and calls `store.listeners`).

`useMapDataset` subscribes to those listeners and exposes **`datasetVersion`**. List UIs must depend on that value — do **not** `watch(getDatasetIds())` or assume `getDatasetIds().value` is a Vue Ref (ids are often mutated in place with the same array reference).

| Framework | `datasetVersion` | Typical usage |
| --- | --- | --- |
| Vue | `Ref<number>` | `watch(datasetVersion, refresh, { immediate: true })` or `void datasetVersion.value` inside `computed` |
| React | `number` | `useEffect(..., [datasetVersion])` or read it in render |

Built-in hosts (`LayerControl` / `LayerList`, `DatasetControl`, `IdentifyControl`, …) already follow this. Custom list UIs should do the same.

## API

```ts
const {
  addDataset,
  removeDataset,
  removeComponent,
  getDatasets,
  getDatasetIds,
  getAllComponentsByType,
  getStoreDataset,
  setMapId,
  datasetVersion,
} = useMapDataset(mapId);
```

| Method | Role |
| --- | --- |
| `addDataset(dataset)` | Add tree to the map (respects `dependsOn`); notifies listeners |
| `removeDataset(dataset)` | Remove tree from the map; notifies listeners |
| `removeComponent(node)` | Remove one node (e.g. a list row); notifies listeners |
| `getDatasets()` | Root datasets (snapshot) |
| `getDatasetIds()` | Plain `{ value: string[] }` box of root ids (not framework-reactive) |
| `getAllComponentsByType<T>(type)` | e.g. `'list'`, `'identify'` |
| `getStoreDataset()` | Current `MapDatasetStore` or `undefined` |
| `setMapId(id)` | Bind after mount |
| `datasetVersion` | Bumped on `notifyMapDatasetStore` — drive list UI updates |

```ts
function onMapLoaded(map: MapSimple) {
  const { addDataset } = useMapDataset(map.id);
  addDataset(createRootDataset('Sample'));
}
```

### Vue — refresh a custom list

```ts
const { getDatasets, datasetVersion } = useMapDataset(mapId);
watch(datasetVersion, () => {
  views.value = getDatasets();
}, { immediate: true });
```

### React — refresh a custom list

```ts
const { getDatasets, datasetVersion } = useMapDataset(mapId);
useEffect(() => {
  setViews(getDatasets());
}, [datasetVersion, getDatasets]);
```

**Events:** none. Subscribe to list-node events (`toggleShow`, `changeOpacity`) — see [Events](../create-dataset/with-helper-event.md).

See also [Map store](/map/core/map-store) (`MAP_DATASET_STORE_KEY` / `ensureMapDatasetStore` / `notifyMapDatasetStore`).
