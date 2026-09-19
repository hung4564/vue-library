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

When **IdentifyControl** owns the click, hosts call `syncIdentifyPointerPick(mapId, true)` so the controller sets `pointerClickEnabled = false` (hover still works). Part `pointer.click` can stay enabled — the controller gate is enough.

## Host lifecycle via map mitt

Vue/React hosts **do not** call `clearHighlight` / `onDetailClose` / `onIdentifyClose` directly. Prefer **`emitHighlight*Close`** helpers (they attach `mapId` and ensure the bridge briefly). Or emit on the per-map mitt bus yourself; a mitt bridge listens and runs the session API.

**Import:** `@hungpvq/map-dataset/highlight`  
**Raw mitt (optional):** `useMapMittStore` / `getMapMittStore` from `@hungpvq/vue-map-core` or `@hungpvq/react-map-core`

| API | Role |
| --- | --- |
| `bindHighlightMittBridge(mapId)` | Ensure listeners + return **clean disposer** (call on unmount) |
| `releaseHighlightMittBridge(mapId)` | Drop one consumer ref; unbind when last |
| `cleanHighlightMittBridge(mapId)` / `destroyHighlightMittBridge` | Force unbind (map / controller teardown) |
| `emitHighlightAttributeTableClose` / `emitHighlightDetailClose` / `emitHighlightIdentifyClose` / `emitHighlightClear` | Host-friendly emit (`mapId` filled in) |

**Close payload** (`MapDatasetClosePayload`): `{ mapId, item?, dataset? }`. Hosts always send `mapId`; attach `dataset` (and `item` for Detail) when known so app listeners can scope cleanup.

| Event (`MAP_DATASET_EVENT`) | Payload | Session effect |
| --- | --- | --- |
| `ATTRIBUTE_TABLE_CLOSE` | `{ mapId, dataset? }` | `clearHighlight('attribute-table')` |
| `DETAIL_CLOSE` | `{ mapId, item?, dataset? }` | `onDetailClose` |
| `IDENTIFY_CLOSE` | `{ mapId, dataset? }` (scoped filter when set) | `onIdentifyClose` |
| `CLEAR` | same as `clearHighlight` target | `clearHighlight` |

```ts
import {
  bindHighlightMittBridge,
  emitHighlightAttributeTableClose,
  emitHighlightDetailClose,
  MAP_DATASET_EVENT,
  type MapDatasetEvent,
} from '@hungpvq/map-dataset/highlight';
import { useMapMittStore } from '@hungpvq/vue-map-core';
// or: import { useMapMittStore } from '@hungpvq/react-map-core';

const unbind = bindHighlightMittBridge(mapId);
// onUnmounted / useEffect cleanup:
unbind();

// Preferred — helpers attach mapId
emitHighlightAttributeTableClose(mapId, { dataset: layer });
emitHighlightDetailClose(mapId, { item, dataset: view });

// Equivalent raw mitt
const mitt = useMapMittStore<MapDatasetEvent>(mapId);
mitt.emit(MAP_DATASET_EVENT.ATTRIBUTE_TABLE_CLOSE, { mapId, dataset: layer });
```

## Highlight session API (UX intents)

Hosts prefer **mitt emit** (above). FallbackResolver / core still call **session helpers** directly. Session paints use cascade / part `durationMs` (default 5000) — close via mitt / `clearHighlight` still clears intents early.

**Import:** `@hungpvq/map-dataset/identify`

| API | Role |
| --- | --- |
| `paintHighlight(mapId, { intent, feature, dataset? })` | Paint one feature by UX intent |
| `paintHighlights(mapId, { intent, features, dataset? })` | Clear intent then paint many (AttributeTable multi-select) |
| `clearHighlight(mapId, intent \| { featureId } \| 'identify-session')` | Clear by intent, feature id, or identify session |
| `onDetailClose(mapId, item?)` | Close Detail → hide `detail` + `hideEntry(featureId)` |
| `onIdentifyClose(mapId)` | Turn off Identify → exclusive UI + clear identify |
| `paintIdentifyResultFocus(mapId, child)` | Result-panel row focus → identify paint |
| `clearIdentifyResultHighlight(mapId)` | Clear identify session paint |
| `syncIdentifyPointerPick(mapId, clickActive)` | Identify owns click → `pointerClickEnabled = !clickActive` |

### UX matrix (library defaults)

| Owner | When it paints |
| --- | --- |
| **Identify** | Only if the pick has **exactly 1** feature **and** Identify owns the hit (`hitAction` is not `detail` / `table`). Multi → clear identify, no paint. |
| **Detail** | Paints the **single feature** being shown (`hitAction:'detail'` or menu detail). Close → mitt `DETAIL_CLOSE`. |
| **Attribute table** | Paints **all selected rows** (`sources: ['attribute-table']` → `paintHighlights`). Close → mitt `ATTRIBUTE_TABLE_CLOSE`. |
| **Identify → Detail / Table** | Identify clears its own paint; Detail / Table owns highlight afterward. |

| Scenario | Behavior |
| --- | --- |
| **A** Identify → Detail → close | `hitAction:'detail'` → `paintHighlight(detail)`. Close → mitt `DETAIL_CLOSE`. |
| **B** Multi → result panel | Multi → clear identify (no paint). Focus row → `paintIdentifyResultFocus` (one feature). |
| **C** Menu Detail | Menu → `paintHighlight(detail)`. Close → mitt `DETAIL_CLOSE`. |
| **D** Fit bounds | Camera only via `runFitBoundsMenuAction` — never paints highlight. |
| **E** Attribute table | All selected features highlighted; empty selection clears. |
| **F** Pointer vs Identify | Identify click active → `syncIdentifyPointerPick(true)` disables pointer click pick. |

### Clear matrix

| User action | Host emit / session |
| --- | --- |
| Close Detail | mitt `DETAIL_CLOSE` → `onDetailClose` |
| Identify click elsewhere | `closeIdentifyExclusiveUi` + new paint |
| Turn off Identify | mitt `IDENTIFY_CLOSE` → `onIdentifyClose` |
| Close AttributeTable | mitt `ATTRIBUTE_TABLE_CLOSE` → `clearHighlight('attribute-table')` |
| No orphan glow | Close mitt / `clearHighlight` / duration timers call `hideEntry(id)` |

```ts
import { paintHighlight, paintIdentifyResultFocus } from '@hungpvq/map-dataset/identify';
import { emitHighlightDetailClose } from '@hungpvq/map-dataset/highlight';
import { runFitBoundsMenuAction } from '@hungpvq/map-dataset/menu';

await paintHighlight(mapId, { intent: 'detail', feature, dataset });

emitHighlightDetailClose(mapId, { item, dataset: view });

// UX D — camera only
runFitBoundsMenuAction(map, { detail: feature });
```

## HighlightResolver (Identify / AttributeTable map FX)

After each Identify run (and AttributeTable row selection), map paint goes through a **FallbackResolver** — same registry pattern as the Identify UI resolver. Defaults **delegate to the session API** above.

**Import:** `@hungpvq/map-dataset/identify`

| API | Role |
| --- | --- |
| `createDefaultHighlightResolver()` | Fresh default (compose / override) |
| `highlightResolver` | Package default instance |
| `setGlobalHighlightResolver` / `getGlobalHighlightResolver` | Process default on `map:core:meta.registries['highlight-resolver']` |
| `setHighlightResolver(mapId, resolver \| null)` / `getHighlightResolver(mapId)` | Per-map override on `map:core[mapId].resolver['highlight-resolver']` |
| `runHighlightFromRecords({ mapId, records, hitAction?, … })` | Identify path helper (`records` → features in prepare) |
| `HighlightContext` | `{ mapId, records?, features?, count?, dataset?, sources?, hitAction?, signal? }` |

**Default policy:**

| Context | Default |
| --- | --- |
| `sources: ['attribute-table']` | `paintHighlights` for **all** features (or clear if empty) |
| `hitAction:'detail'` + exactly 1 feature | `paintHighlight({ intent: 'detail' })` — Detail owns paint |
| `hitAction:'table'` | `clearHighlight('identify')` — Table owns paint after open |
| Identify owns + exactly 1 feature | `paintHighlight({ intent: 'identify' })` |
| Identify owns + 0 / multi | `clearHighlight('identify')` — no multi paint |

```ts
import {
  createDefaultHighlightResolver,
  setGlobalHighlightResolver,
  setHighlightResolver,
  getHighlightResolver,
  highlightResolver,
  paintHighlight,
} from '@hungpvq/map-dataset/identify';

// Global override (demo / app-wide) — prefer session paint
const custom = createDefaultHighlightResolver();
custom.clear().add({
  when: (ctx) => (ctx.count ?? 0) >= 1 && !!ctx.features?.[0],
  execute: async (ctx) => {
    await paintHighlight(ctx.mapId, {
      intent: 'identify',
      feature: ctx.features![0]!,
      dataset: ctx.dataset,
    });
  },
});
setGlobalHighlightResolver(custom);

// Per-map (null clears override → falls back to global / package default)
setHighlightResolver(mapId, createDefaultHighlightResolver());

await getHighlightResolver(mapId).execute({
  mapId,
  records: nonEmptyIdentifyResults,
  hitAction: 'detail',
  signal,
});

// Restore package default
setGlobalHighlightResolver(highlightResolver);
```

IdentifyControl path: after UI resolve, `runIdentifyMulti` / `runIdentifyShowFirst` pass `hitAction` into `getHighlightResolver(mapId).execute`. AttributeTable calls `getHighlightResolver(mapId).execute({ mapId, count, features, sources: ['attribute-table'], … })`.

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
| `hide` / `hideEntry` / `hideIfSource` | Clear paint (`hideEntry` removes **all** entries with that id; duration timers call `hideEntry`) |
| `pickAt` | Query layers at a point/box |
| `bindPointer` | Map click / mousemove → `pickAt` |
| `setPointerClickEnabled` / `pointerClickEnabled` | Gate click pick while Identify owns the map click |
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
5. Attribute-table / identify / menu call **session helpers** (`paintHighlight` / `clearHighlight` / `onDetailClose` / …) or `getHighlightResolver(mapId).execute` — prefer those over raw `show` / `hideIfSource`. Hosts close via `emitHighlight*Close` (or mitt events), not session APIs directly.
6. Do not import highlight APIs from `@hungpvq/map-dataset` root.
