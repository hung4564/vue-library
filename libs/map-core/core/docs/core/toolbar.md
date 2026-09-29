# Toolbar

Framework-agnostic button strip for map chrome when controls resolve to `toolbar` or `menu` layout. Pure protocol lives in `@hungpvq/map-core/toolbar`; Vue/React host `ToolbarControl` and wire it through `useMapControl`.

Related: [Stable API — control layout](./stable-api.md), [UniversalRegistry controls](./registry-controls.md), [map store `TOOLBAR`](./map-store.md).

## Mental model

```
Author options (single | module | module-expandable)
        │
        ▼
normalizeToolbarSpec(+ layout wrap)  ← only place that switches on kind
        │
        ▼
createFromFlatButtons / createLiveToolbarStrategy
        │
        ▼
MapToolbarStore (buttons + expandedModuleId)
        │
        ▼
ToolbarControl: planToolbarLayout + planToolbarExpansion + shared click
```

| Piece                           | Role                                                                      |
| ------------------------------- | ------------------------------------------------------------------------- |
| **Author options**              | Declarative buttons on a control (`useMapControl({ toolbar: … })`)        |
| **`normalizeToolbarSpec`**      | Kind → flat list with ids, `group`, `role`, `expandable`                  |
| **`withLayoutToolbarOptions`**  | Stamp control layout (`visible` / `order` / `position`) onto every button |
| **`createLiveToolbarStrategy`** | Mount/sync/unmount; always re-reads latest options (Vue/React refs)       |
| **`createToolbarModuleApi`**    | Register into the store only when layout is `toolbar` \| `menu`           |
| **`ToolbarControl`**            | Renders store buttons; overflow; expandable secondary row                 |

Standalone / custom `#btn` slots (Theme, Language, Measurement click-expand) stay on the control — they do **not** go through the strip. The strip only shows buttons registered while layout is toolbar/menu.

## Kinds

### `single`

One button. Id is the control/button id.

```ts
{
  kind: 'single', // optional default
  id: 'mapHomeControl',
  getState: () => mdiButtonState(path, { title: 'Home' }),
  onClick: (e) => { … },
}
```

### `module`

Several buttons sharing `moduleId` as `group`. All stay on the **primary** row (subject to overflow).

```ts
{
  kind: 'module',
  moduleId: 'mapZoomControl',
  order: 20,
  orientation: 'column',
  buttons: [
    { id: 'in', getState: () => …, onClick: () => … },
    { id: 'out', getState: () => …, onClick: () => … },
  ],
}
```

Store ids: `` `${moduleId}:${buttonId}` ``.

### `module-expandable`

Primary row shows a **launcher** from `expandableButton({ active })`. Options live on a **secondary** row while the module is open.

```ts
{
  kind: 'module-expandable',
  moduleId: 'mapThemeControl',
  closeOnOutsideClick: true, // default; set false to keep secondary open on outside click
  expandableButton: ({ active }) =>
    mdiButtonState(icon, { title: 'Theme', active }),
  orientation: 'row',
  buttons: [
    { id: 'light', getState: () => …, onClick: () => setMode('light') },
    { id: 'dark', getState: () => …, onClick: () => setMode('dark') },
  ],
}
```

| Behavior          | Detail                                                                               |
| ----------------- | ------------------------------------------------------------------------------------ |
| Launcher `active` | Synced from `expandedModuleId === moduleId`                                          |
| Click launcher    | `toggleExpandedModule(moduleId)` via `handleToolbarButtonClick`                      |
| Secondary row     | Option buttons of that module (+ close control in the host UI)                       |
| Option click      | Same path as normal buttons: `btn.action(e)`                                         |
| Close             | Secondary close, Escape, or outside pointerdown when `closeOnOutsideClick !== false` |

Stamps: launcher `role: 'launcher'`, `expandable: true`; options `role: 'option'`, `expandable: true`.

## Shared helpers (extend here, not in hosts)

| Helper                                                                    | Use                                                 |
| ------------------------------------------------------------------------- | --------------------------------------------------- |
| `normalizeToolbarSpec`                                                    | Add a new kind or stamp — **only** switch on `kind` |
| `mapToolbarOptions` / `withLayoutToolbarOptions`                          | Map UI state across all buttons                     |
| `createFromFlatButtons`                                                   | Register/sync/unmount a flat list                   |
| `createLiveToolbarStrategy(getOptions, toolbar, { getExpandedModuleId })` | Host binding                                        |
| `planToolbarLayout`                                                       | Overflow / corner budgets                           |
| `planToolbarExpansion`                                                    | Primary vs secondary for expandable groups          |
| `handleToolbarButtonClick`                                                | Launcher toggle vs option `action`                  |
| `shouldCloseExpandedOnOutsideClick`                                       | Respect `closeOnOutsideClick` on the launcher       |

Vue and React `ToolbarControl` should stay thin: call these helpers, render `MapCommonButton`.

## Host wiring

```ts
import { createLiveToolbarStrategy, withLayoutToolbarOptions } from '@hungpvq/map-core/toolbar';

const opts = withLayoutToolbarOptions(authorToolbar, () => layout);
const strategy = createLiveToolbarStrategy(() => opts, toolbarModuleApi, { getExpandedModuleId: () => storeApi.getExpandedModuleId() });
strategy.mount();
// on language / layout change:
strategy.sync();
```

Mount `ToolbarControl` on the map when any control uses `controlLayout: 'toolbar'` or mobile `buttonInMobile: 'toolbar' | 'menu'`.

## Extending later

1. Prefer new **button metadata** (`role`, flags) + `planToolbarExpansion` / click helper updates over new host `if (kind)`.
2. New author kind → one case in `normalizeToolbarSpec`, then reuse `createFromFlatButtons` / `createLiveToolbarStrategy`.
3. Do **not** add parallel static `createToolbar*` wrappers — hosts bind via `createLiveToolbarStrategy` only.
4. Keep adapters free of GIS/layout math — only refs, mount, and UI.
