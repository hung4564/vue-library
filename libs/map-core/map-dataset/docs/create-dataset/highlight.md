# Highlight

Paint selected / identified / pointer-picked features via **`@hungpvq/map-dataset/highlight`**.

Dataset parts hold configuration only. Painting and pointer binding run through **`getHighlightController(mapId)`** (or adapter **`useMapHighlight(mapId)`**). Demo apps mount a thin **`HighlightPointer`** shell that calls `bindPointer` — there is no `LayerHighlight` control.

**Import:** always from `@hungpvq/map-dataset/highlight` (not the package root).

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

Shell must enable the matching events:

```vue
<!-- Vue demo shell -->
<HighlightPointer enable-click enable-hover />
```

```tsx
<HighlightPointer enableClick enableHover />
```

Adapters: `useMapHighlight(mapId).bindPointer({ click, hover })`. Core: `getHighlightController(mapId).bindPointer(…)`. Destroy with `destroyHighlightController(mapId)` from `@hungpvq/map-dataset/highlight` (do not re-export from Vue/React adapters).

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
3. Replace `<LayerHighlight …>` with app shell **`HighlightPointer`** (or `useMapHighlight().bindPointer`).
4. Attribute-table / identify / menu call `show` / `hideIfSource` with `source: 'attribute-table' | 'identify' | …` — no mount requirement beyond the controller existing when you call it.
5. Do not import highlight APIs from `@hungpvq/map-dataset` root.
