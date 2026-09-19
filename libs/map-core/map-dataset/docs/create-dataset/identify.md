# Identify

Click / box-select features. Attach menus with `createMenuBuilder` (see [Menus](./with-helper-menu.md)).

Mount [`IdentifyControl`](../module/IdentifyControl.md) (or [`IdentifyShowFirstControl`](../module/IdentifyShowFirstControl.md)) on the map. Dialogs from identify menus need [`ComponentManagementControl`](../module/ComponentManagementControl.md).

**IdentifyControl** paints highlight after each query via `getHighlightResolver(mapId).execute` with `hitAction` from UI resolve — defaults use the [highlight session API](./highlight.md#highlight-session-api-ux-intents) (`paintHighlight` / `clearHighlight`; cascade `durationMs`). Close emits mitt `IDENTIFY_CLOSE` via `emitHighlightIdentifyClose` (payload `{ mapId, dataset? }` when scoped to one identify node) — hosts do not call `onIdentifyClose` directly. **ShowFirst** and the Identify session abort superseded clicks the same way (`AbortController` + `requestId`).

When `hitAction` is `table`, Identify opens AttributeTable and selects rows by stable `_id` / business id — see [Attribute table](./attribute-table.md#identify--row-select-keys).

**Geometry resolve order** (fit-bounds / Detail / highlight):

Shared `FallbackResolver` pipeline for **single** and **merge** (`resolveIdentifyFeatures` → `Feature[]`):

0. Dedupe MapLibre hits by primary id: `field_id` → `_id` → `feature.id` → `id`  
1. Identify `getFeature?` → always return `Feature[]` (or `null` to fall through)  
   - 1 hit: `{ feature, source, id }`  
   - ≥2 hits / merge: `{ features, source, ids }`  
2. Else match **GeoJSON source** Feature by `field_id` / `_id`  
3. Else MapLibre `queryRenderedFeatures` geometry (may drift with zoom)

Row `id` uses the same primary-id order so Identify ↔ AttributeTable stay aligned when sources use `promoteId: '_id'`.

**Events:** none on the identify node. Menu `setClick` receives `{ layer, mapId, value, event, meta, context }` (`value` is the feature).

Each hit is a flat `{ id, name, data }` feature under an identify node (`IdentifyMultiResult`).

## Config

```ts
{
  field_id?: string;   // default 'id'
  field_name?: string; // default 'name'
  fields?: { text: string; value: string }[];
  onSingle?: 'detail' | 'table' | 'result' | 'auto';  // one feature hit
  onMultiple?: 'detail' | 'table' | 'result' | 'auto'; // many hits (`detail` = first)
}
```

## Factories

```ts
import { createIdentifyMapboxComponent, createIdentifyMapboxMergedComponent, createDatasetPartIdentifyComponentBuilder } from '@hungpvq/map-dataset/identify';
import { createMenuItemShowDetailForItem, createMenuItemToBoundActionForItem } from '@hungpvq/map-dataset/menu';

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
| `onSingle(action)` | UI when exactly one feature is hit (`detail` \| `table` \| `result` \| `auto`) |
| `onMultiple(action)` | UI when multiple features are hit (`detail` = first/top feature) |
| `setGetFeature(fn)` | Geometry enrichment (`Feature[]`); see below |
| `addMenu` / `addMenus` | Actions on each result |

```ts
createDatasetPartIdentifyComponentBuilder('API identify')
  .setConfigFields([{ text: 'Id', value: 'id' }])
  .onSingle('detail')
  .onMultiple('result')
  .build();
```

```ts
createDatasetPartIdentifyComponentBuilder('API identify')
  .setConfigFields([{ text: 'Id', value: 'id' }])
  .onSingle('result')
  .onMultiple('result')
  .build();
```

## Presentation (`onSingle` / `onMultiple`)

IdentifyControl passes `singleLayer: true` when the layer filter (InputSelect / layer-item) scopes to one identify node. Hit UI uses `resolveIdentifyHitAction`:

| Mode | Typical UI |
| --- | --- |
| `onSingle` / `onMultiple` = `auto` (default) | Legacy: show-detail (1 feature, single layer) or attribute table; else result panel |
| Explicit `detail` / `table` / `result` | Force that UI when menus exist (`detail` on multi opens first feature) |
| All layers (no single-layer scope) | Usually result panel unless node policy forces detail/table |

Policy when several identify nodes hit: use the **first** non-empty record’s config.

Per identify (builder):

```ts
createDatasetPartIdentifyComponentBuilder('My layer')
  .onSingle('table')
  .onMultiple('result')
  .build();
```

### Resolver override (UI)

```ts
import {
  createDefaultIdentifyResolver,
  setGlobalIdentifyResolver,
  setIdentifyResolver,
} from '@hungpvq/map-dataset/identify';

setGlobalIdentifyResolver(createDefaultIdentifyResolver());
setIdentifyResolver(mapId, createDefaultIdentifyResolver());
```

### HighlightResolver (map FX)

After UI resolve, Identify runs:

```ts
await getHighlightResolver(mapId).execute({ mapId, records, signal });
```

Default: one feature → paint (`source: 'identify'`); multi / empty → clear. AttributeTable uses `getHighlightResolver(mapId).execute` with `source: 'attribute-table'`.

```ts
import {
  createDefaultHighlightResolver,
  setGlobalHighlightResolver,
  setHighlightResolver,
  getHighlightResolver,
  highlightResolver,
} from '@hungpvq/map-dataset/identify';

setGlobalHighlightResolver(createDefaultHighlightResolver());
setHighlightResolver(mapId, createDefaultHighlightResolver()); // null clears
// restore: setGlobalHighlightResolver(highlightResolver);
```

Registry keys: global `map:core:meta.registries['highlight-resolver']`; per-map `map:core[mapId].resolver['highlight-resolver']`. See [Highlight](./highlight.md#highlightresolver-identify--attributetable-map-fx).

## `getFeature` (geometry enrichment)

After MapLibre hit-test (and id dedupe), Identify resolves each hit to a GeoJSON `Feature` via `FallbackResolver`:

1. Optional `getFeature` on the Identify node  
2. Sibling GeoJSON **source** (match by `field_id` / `_id`)  
3. MapLibre rendered geometry

**Always return `Feature[]`** (or `null` / `undefined` to skip to source). Query shape:

| Hits | Query | Return |
| --- | --- | --- |
| 1 | `{ feature, source, id }` | `Feature[]` (usually length 1) |
| ≥2 / merge group | `{ features, source, ids }` | `Feature[]` parallel to `features` / `ids` |

```ts
import {
  createIdentifyMapboxComponent,
  createDatasetPartIdentifyComponentBuilder,
} from '@hungpvq/map-dataset/identify';

createIdentifyMapboxComponent(
  'Identify',
  { field_id: '_id', field_name: 'name' },
  {
    async getFeature(query) {
      if ('features' in query && query.features) {
        return Promise.all(
          query.ids.map(async (id) => {
            const detail = await fetch(`/api/detail/${id}`).then((r) => r.json());
            return detail; // GeoJSON Feature
          }),
        );
      }
      const detail = await fetch(`/api/detail/${query.id}`).then((r) => r.json());
      return [detail];
    },
  },
);

// Builder
createDatasetPartIdentifyComponentBuilder('API identify')
  .configFieldId('_id')
  .setGetFeature(async (query) => {
    if ('features' in query && query.features) {
      return query.features.map((f, i) => ({
        type: 'Feature' as const,
        id: query.ids[i],
        properties: { ...(f as { properties?: object }).properties, status: 'enriched' },
        geometry: (f as { geometry: GeoJSON.Geometry }).geometry,
      }));
    }
    return null; // fall through to source / rendered
  })
  .build();
```

While resolve runs, [`IdentifyControl`](../module/IdentifyControl.md) shows **loading on the Identify toolbar button**.

Single and merge Identify share the same pipeline (`buildIdentifyFeatureRows` / `resolveIdentifyFeatures`); merge only differs by one MapLibre query across layers, then per-Identify `getFeature({ features, source, ids })`.

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
dataset.add(createHighlightPart());
```

```ts
import { createHighlightPart } from '@hungpvq/map-dataset/highlight';
```
