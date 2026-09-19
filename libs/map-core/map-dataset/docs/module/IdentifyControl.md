# Identify Control

Click or box-select features. Presentation uses menus on the identify dataset node and an internal resolver (detail → attribute table → result panel).

## Architecture (thin host)

Orchestration is owned by Experimental **`createIdentifySession`** (`@hungpvq/map-dataset/identify`): control model state, `runIdentifyMulti` query pipeline, and map-click / bbox mode flags. Vue and React `IdentifyControl` stay thin hosts — they wire EventClick / EventBbox, registry, highlight store, and toolbar UI, then sync from `session.getState()` after `applyScopedSession` / `toggleShow` / `closeAndCleanup` / setters.

**IdentifyControl highlight:** after each query, `getHighlightResolver(mapId).execute` paints when the (global / per-map) HighlightResolver matches — default: exactly one feature (`source: 'identify'`); multi-hit clears that source. On close the control still calls `hideIfSource('identify')`. Menu-driven paint can also use `source: 'identify'` (see [Highlight](../create-dataset/highlight.md)). That is separate from **`pointer.click`** on a highlight part: Identify’s click query does not require `bindPointer`, and enabling both Identify and pointer click can double-fire — disable `pointer.click` on parts or bind hover-only when Identify owns the click.

**Concurrency:** each map click / box query aborts the previous in-flight run (`AbortController`) and bumps a monotonic `requestId` (session `queryGeneration`). The result panel ignores updates with an older `requestId`.

Identify view lists refresh when datasets change via `useMapDataset().datasetVersion` — see [useMapDataset](../helper/useMapDataset.md).

**Touch / coarse pointer:** hover highlight is skipped when `(hover: hover)` is false; box-select supports touch; on coarse pointers, a **long-press** (~500ms) runs the same identify click path. Map clicks use the `click` event only (no duplicate touchstart identify).

## Props

<!--@include: ../../core/module/props.md-->

| Prop | Type | Default | Effect |
| --- | --- | --- | --- |
| `show` | `boolean` | — | Identify session active (toolbar) |
| `immediately` | `boolean` | `false` | Start click-identify on mount |

## Slots

None.

## Events

None. Feature actions are identify-node menus. Mount [`ComponentManagementControl`](./ComponentManagementControl.md) so Show detail / Style can open.

## Loading and empty results

- While `getFeatures` / `getList` / `getMergedFeatures` runs, the **Identify toolbar button** shows `loading` (spinner). Map cursor may switch to `wait`.
- **Empty hits do not open** the result panel — loading simply ends (stale items are cleared).
- The result panel opens only when the resolved hit action is **result** (or `auto` falls through to result). If that panel is already open, its in-panel loading state stays in sync.

Turning on identify from a **layer menu** starts click mode and sets the layer filter; it does **not** auto-open the result panel.

## Resolver (short)

Hit UI is driven by `resolveIdentifyHitAction` (then the default `identifyResolver`):

1. Builder `onSingle` / `onMultiple` (`detail` | `table` | `result` | `auto`) from the **first** hit record  
2. `auto` (default): single layer + one feature + show-detail → **detail**; else single layer + attribute-table menu → **table**; else **result**  
3. Always sync result-panel items (even if the panel stays closed). Exclusive detail/table does **not** auto-open the result panel, and does **not** force-close it if the user already opened it.  
4. When the resolved action is **result** and there are hits → auto-open result panel  

Each resolve first **closes** any open LayerDetail / AttributeTable (and their highlight sources) so a multi-hit table does not stack on top of a previous single-hit detail.

**Highlight (map FX):** after UI resolve, `getHighlightResolver(mapId).execute` paints only when exactly **one** feature is hit; multi-hit clears identify highlight (no paint). AttributeTable selection uses the same helper (`source: 'attribute-table'`). Override via `setGlobalHighlightResolver` / `setHighlightResolver`.

IdentifyControl toolbar **active** follows the result panel open state (not layer-item scoped identify). Layer-item Identify enables click + layer filter without lighting the toolbar.

### Builder hit policies

```ts
createDatasetPartIdentifyComponentBuilder('Buildings')
  .onSingle('detail')
  .onMultiple('table')
  .build();
```

Force result panel via builder (`onSingle`/`onMultiple` = `'result'`):

```ts
createDatasetPartIdentifyComponentBuilder('Buildings')
  .onSingle('result')
  .onMultiple('result')
  .build();
```

### Override identify resolver (global or per map)

```ts
import {
  createDefaultIdentifyResolver,
  setGlobalIdentifyResolver,
  setIdentifyResolver,
  createDefaultHighlightResolver,
  setGlobalHighlightResolver,
  setHighlightResolver,
} from '@hungpvq/map-dataset/identify';

// Compose on a fresh default (process default on `map:core:meta.registries`)
const custom = createDefaultIdentifyResolver();
setGlobalIdentifyResolver(custom);
// Per-map override on `map:core[mapId].resolver['identify-resolver']`
setIdentifyResolver(mapId, custom); // pass null to clear

// Highlight map-FX uses the same registry pattern
setHighlightResolver(mapId, createDefaultHighlightResolver());
// Or replace the package-wide default:
// setGlobalHighlightResolver(createDefaultHighlightResolver());
```

See [Identify](../create-dataset/identify.md) for `getList` / merge APIs and `singleLayer`.

## Vue

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import {
  IdentifyControl,
  ComponentManagementControl,
  useMapHighlight,
} from '@hungpvq/vue-map-dataset';
import { destroyHighlightController } from '@hungpvq/map-dataset/highlight';
import { onUnmounted } from 'vue';
import '@hungpvq/map-core/style.css';
import '@hungpvq/map-dataset/style.css';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
import '@hungpvq/vue-draggable/style.css';

// Optional: pointer highlight in addition to Identify (watch dual-click).
const hl = useMapHighlight(mapId);
const unbind = hl.bindPointer({ click: false, hover: true });
onUnmounted(() => {
  unbind();
  destroyHighlightController(mapId);
});
</script>

<template>
  <Map>
    <IdentifyControl position="top-right" show />
    <ComponentManagementControl />
  </Map>
</template>
```

Immediate click mode:

```vue
<IdentifyControl position="top-right" immediately />
```

## React

```tsx
import {
  IdentifyControl,
  ComponentManagementControl,
  useMapHighlight,
} from '@hungpvq/react-map-dataset';
import { destroyHighlightController } from '@hungpvq/map-dataset/highlight';
import { useEffect } from 'react';

function Page({ mapId }: { mapId: string }) {
  const hl = useMapHighlight(mapId);
  useEffect(() => {
    const unbind = hl.bindPointer({ click: false, hover: true });
    return () => {
      unbind();
      destroyHighlightController(mapId);
    };
  }, [hl, mapId]);

  return (
    <>
      <IdentifyControl position="top-right" show />
      <ComponentManagementControl />
    </>
  );
}
```

Immediate click mode: `<IdentifyControl position="top-right" immediately />`.

Identify menus are defined on the identify dataset node. See [Identify](../create-dataset/identify.md).

Right-click **Quick analysis → Identify features** (`MapContextMenuControl`) runs the same query. That menu item is added only when `IdentifyControl` is mounted.

`IdentifyResultControl` is mounted by `IdentifyControl` (no separate install required).

## Accessibility

| Surface | Contract |
|---------|----------|
| Result panel body | `role="region"` + `aria-label` (identify title); `aria-live="polite"` so loading / empty / result updates announce |
| Loading | `role="status"` + `aria-live="polite"` |
| Empty / no selection | `role="status"` |
| Errors | `role="alert"` |
| Result list | `role="status"` wrapper; ArrowUp / ArrowDown move focus among hits; Enter activates the focused hit |

Panel Escape / focus trap stay on the draggable popup shell.

**Highlight ownership (Identify vs pointer):**

- After each Identify query, **HighlightResolver** paints map FX (`getHighlightResolver(mapId).execute` — default single-hit `source: 'identify'`). Override with `setGlobalHighlightResolver` / `setHighlightResolver` (see [Highlight](../create-dataset/highlight.md#highlightresolver-identify--attributetable-map-fx)).
- Menu items with `.setKey('identify')` can also call `hl.show(…, { source: 'identify' })` via `LayerMenuDefaultHandle` / `LIST_VIEW_MENU_ID.highlight`.
- On close, Identify clears identify paint with `hideIfSource('identify')`.
- `bindPointer` uses sources `pointer` / `hover` and is optional for pointer-picking demos. Not required for Identify’s HighlightResolver path.

There is no `LayerHighlight` / adapter `HighlightPointer` component anymore — use `useMapHighlight().bindPointer` or Identify + HighlightResolver.
