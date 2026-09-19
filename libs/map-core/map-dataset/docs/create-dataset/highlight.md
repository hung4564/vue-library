# Highlight

Paint selected / identified / pointer-picked features via **`@hungpvq/map-dataset/highlight`**.

Dataset parts hold configuration only. Painting and pointer binding run through **`getHighlightController(mapId)`** (or adapter **`useMapHighlight(mapId)`**). There is no `LayerHighlight` control and no adapter-exported `HighlightPointer` — apps call `bindPointer` themselves (or rely on Identify → **HighlightResolver** for click paint).

**Import:** always from `@hungpvq/map-dataset/highlight` (not the package root). Highlight **map-FX policy** after Identify / AttributeTable lives on `@hungpvq/map-dataset/identify` (`HighlightResolver` APIs below).

## Attach a part

```ts
import { createHighlightPart } from '@hungpvq/map-dataset/highlight';

dataset.add(createHighlightPart());
// or:
dataset.add(createHighlightPart({ mode: 'outline', color: '#FFB703' }));
```

| Option | Role |
| --- | --- |
| `mode` | `'default'` \| `'outline'` \| `'pulse'` \| `'changeColor'` \| `'custom'` \| … |
| `color` / `durationMs` / `paint` | Style overrides |
| `filterCreator` | Field name or `(feature) =>` MapLibre filter |
| `data` | `{ type: 'local' }` (default), `{ type: 'vector-tile', strategy: 'feature-state' \| 'query', … }`, or `{ type: 'resolver', resolve }` |
| `selection` | `{ policy: 'single' \| 'multiple', replaceScope: 'source' \| 'all', maxEntries? }` |
| `presentation` | `{ popup?, clickAction?, onShow?, onHide? }` — `clickAction`: `'popup'` (default) \| `'detail'` \| `'none'` |
| `pointer` | `{ click?, hover? }` — which map events may pick **this** dataset (default both `true`) |
| `animate` / `createDefaultState` | Required for `mode: 'custom'` |
| `stateKey` | Feature-state key when using VT feature-state |

Cascade when calling `show` / `pickAt`: **call options → part → controller defaults**.

## Modes (migration from old factories)

| Old factory | New |
| --- | --- |
| `createDatasetPartHighlightComponent()` | `createHighlightPart()` or `{ mode: 'default' }` |
| `createDatasetPartShadowHighlightComponent(color)` | `{ mode: 'outline', color }` |
| `createDatasetPartChangeColorHighlightComponent()` | `{ mode: 'changeColor' }` |
| `createDatasetPartFeatureStateHighlightComponent(color)` | GeoJSON demos: `{ mode: 'pulse', color }` (`promoteId` on the **source**). Vector tiles: `{ mode: 'pulse', color, data: { type: 'vector-tile', strategy: 'feature-state' }, stateKey? }` |
| `createDatasetPartCustomAnimateHighlightComponent(animate, createDefaultState, …)` | `{ mode: 'custom', animate, createDefaultState, filterCreator? }` |

`useHighlightAnimation` is removed — custom paint loops go through `mode: 'custom'` or controller paint sessions.

## Pointer policy

Per-part `pointer` filters which datasets participate in map click / hover pick. It does **not** block imperative `show()` (identify, attribute table, menu).

```ts
createHighlightPart({ pointer: { click: true, hover: false } }); // click-only
createHighlightPart({ pointer: { click: false, hover: true } }); // hover-only
createHighlightPart(); // both (default)
```

Shell must enable the matching events via `bindPointer`:

```ts
import { useMapHighlight } from '@hungpvq/vue-map-dataset';
// or: import { useMapHighlight } from '@hungpvq/react-map-dataset';

const hl = useMapHighlight(mapId);
const unbind = hl.bindPointer({ click: true, hover: true });
// on unmount:
unbind();
```

Core: `getHighlightController(mapId).bindPointer(…)`. Destroy with `destroyHighlightController(mapId)` from `@hungpvq/map-dataset/highlight` (do not re-export from Vue/React adapters).

**Lifecycle:** `getHighlightController` registers `registerMapStoreCleanup(mapId, 'highlight', …)`. On `removeMap`, that cleanup unbinds pointer listeners and destroys the controller — apps should still call `unbind()` / `destroyHighlightController` on component unmount when the map shell stays alive.

When **IdentifyControl** owns the click, disable part `pointer.click` (and do not `bindPointer({ click: true })`) so Identify + pointer do not double-fire. Hover-only bind is fine: `bindPointer({ click: false, hover: true })`.

## HighlightResolver (Identify / AttributeTable map FX)

After each Identify run (and AttributeTable row selection), map paint goes through a **FallbackResolver** — same registry pattern as the Identify UI resolver.

**Import:** `@hungpvq/map-dataset/identify`

| API | Role |
| --- | --- |
| `createDefaultHighlightResolver()` | Fresh default (compose / override) |
| `highlightResolver` | Package default instance |
| `setGlobalHighlightResolver` / `getGlobalHighlightResolver` | Process default on `map:core:meta.registries['highlight-resolver']` |
| `setHighlightResolver(mapId, resolver \| null)` / `getHighlightResolver(mapId)` | Per-map override on `map:core[mapId].resolver['highlight-resolver']` |
| `runHighlightFromRecords({ mapId, records, … })` | Identify path helper (`records` → features in prepare) |
| `HighlightContext` | `{ mapId, records?, features?, count?, dataset?, sources?, signal? }` |

**Default policy:** exactly **one** feature → `show` (`source: 'identify'` or caller); otherwise clear those sources (no paint).

```ts
import {
  createDefaultHighlightResolver,
  setGlobalHighlightResolver,
  setHighlightResolver,
  getHighlightResolver,
  highlightResolver,
} from '@hungpvq/map-dataset/identify';
import { getHighlightController } from '@hungpvq/map-dataset/highlight';

// Global override (demo / app-wide)
const custom = createDefaultHighlightResolver();
custom.clear().add({
  when: (ctx) => (ctx.count ?? 0) >= 1 && !!ctx.features?.[0],
  execute: async (ctx) => {
    await getHighlightController(ctx.mapId).show(ctx.features![0]!, {
      source: ctx.sources?.[0] ?? 'identify',
      dataset: ctx.dataset,
    });
  },
});
setGlobalHighlightResolver(custom);

// Per-map (null clears override → falls back to global / package default)
setHighlightResolver(mapId, createDefaultHighlightResolver());

// Same call shape as getIdentifyResolver(mapId).execute({ records, mapId })
await getHighlightResolver(mapId).execute({
  mapId,
  records: nonEmptyIdentifyResults,
  signal,
});

// Restore package default
setGlobalHighlightResolver(highlightResolver);
```

IdentifyControl path: after UI resolve, `runIdentifyMulti` / `runIdentifyShowFirst` call `getHighlightResolver(mapId).execute({ mapId, records, signal })`. AttributeTable calls `getHighlightResolver(mapId).execute({ mapId, count, features, sources: ['attribute-table'], … })`.

Demo: `/#/dataset-highlight` applies a global override (paint first hit even when multi) and uses Identify for click + hover `bindPointer`.

## Controller

```ts
import {
  getHighlightController,
  destroyHighlightController,
} from '@hungpvq/map-dataset/highlight';

const hl = getHighlightController(mapId);
hl.setDefaultStyle({ color: '#004E98', durationMs: 5000 });
hl.setPickDatasets(() => /* datasets with layers */);

await hl.show(feature, { source: 'identify', dataset });
hl.hideIfSource('attribute-table');
hl.hide();

const unbind = hl.bindPointer({ click: true, hover: true });
// …
unbind();
destroyHighlightController(mapId);
```

| Method | Role |
| --- | --- |
| `show` / `showMany` | Resolve data → paint (+ presentation) |
| `hide` / `hideEntry` / `hideIfSource` | Clear paint |
| `pickAt` | Query layers at a point/box |
| `bindPointer` | Map click / mousemove → `pickAt` |
| `setDefaultStyle` / `Data` / `Selection` / `Presentation` | Global defaults |
| `subscribe` | React to `entries` changes |

### Vue / React

```ts
import { useMapHighlight } from '@hungpvq/vue-map-dataset';
// or: import { useMapHighlight } from '@hungpvq/react-map-dataset';
import { destroyHighlightController } from '@hungpvq/map-dataset/highlight';

const hl = useMapHighlight(mapId);
```

## Vector-tile sample

```ts
createHighlightPart({
  mode: 'pulse',
  color: '#E63946',
  data: {
    type: 'vector-tile',
    strategy: 'feature-state',
    source: 'my-vt-source',
    sourceLayer: 'buildings',
  },
  stateKey: 'highlight',
});
```

Prefer `promoteId` on the MapLibre source definition when using feature-state.

## Presentation

```ts
createHighlightPart({
  presentation: {
    /**
     * Click pick only. Hover always paints without popup/detail.
     * - 'popup' (default): MapLibre popup
     * - 'detail': open LayerDetail (dataset needs showDetail item menu)
     * - 'none': paint only
     */
    clickAction: 'popup',
    popup: true, // optional; clickAction 'popup' enables MapLibre popup when omitted
    onShow: (entry) => {
      /* open custom UI; return cleanup */
    },
    onHide: (entry) => {
      /* close custom UI */
    },
  },
});

// Click → LayerDetail instead of popup
createHighlightPart({
  presentation: { clickAction: 'detail' },
});
```

Hover never shows a MapLibre popup. Imperative `show(..., { source: 'attribute-table' })` is unchanged by `clickAction` (not a pointer source).

## Migration checklist

1. Replace `createDatasetPart*Highlight*` → `createHighlightPart` from `/highlight`.
2. Remove `IHighlightView` / `HighlightHandle` / `useHighlightAnimation` usage.
3. Replace `<LayerHighlight …>` / adapter `HighlightPointer` with `useMapHighlight().bindPointer` (or Identify + `HighlightResolver` for click paint).
4. Rename former Identify highlight APIs: `*IdentifyHighlight*` → `*Highlight*` (`createDefaultHighlightResolver`, `setGlobalHighlightResolver`, `getHighlightResolver`, `HighlightContext`, …). **Major** SemVer.
5. Attribute-table / identify / menu call `show` / `hideIfSource` with `source: 'attribute-table' | 'identify' | …` — or go through `getHighlightResolver(mapId).execute`.
6. Do not import highlight APIs from `@hungpvq/map-dataset` root.
