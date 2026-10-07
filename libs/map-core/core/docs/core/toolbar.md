# Toolbar

Framework-agnostic button strip for map chrome when controls resolve to `toolbar` or `menu` layout. Pure protocol lives in `@hungpvq/map-core/toolbar`; Vue/React host `ToolbarControl` and wire it through `useMapControl`.

Related: [Stable API — control layout](./stable-api.md), [UniversalRegistry controls](./registry-controls.md), [Custom controls (`useMapControl`)](./module/core/custom-controls.md), [map store `TOOLBAR`](./map-store.md).

## Mental model

```
Author options
  host.button  →  corner / auto-button (ModuleContainer)
  toolbar      →  strip (toolbar | menu layout)
        │
        ▼
createHostStrategy (useMapControl)
  standalone | button  →  createLiveToolbarStrategy(noop Toolbar)
  toolbar | menu       →  createLiveToolbarStrategy(MapToolbarStore api)
        │
        ▼
ToolbarControl: planToolbarLayout + planToolbarExpansion + shared click
```

| Piece                            | Role                                                                      |
| -------------------------------- | ------------------------------------------------------------------------- |
| **`host.button`** / **`toolbar`** | Independent corner vs strip author options                               |
| **`createHostStrategy`**         | Adapter entry: layout switch + expand ctx                                 |
| **`createLiveToolbarStrategy`**  | Only engine for all kinds (pass noop `Toolbar` for host-only)             |
| **`createToolbarModuleApi`**     | Register into the store only when layout is `toolbar` \| `menu`           |
| **`ToolbarControl`**             | Renders store buttons; overflow; expandable secondary row                 |

Do not merge or fall back between `host.button` and `toolbar` (same object is fine for simple singles).

```ts
const chrome = {
  kind: 'module-expandable',
  moduleId: 'mapThemeControl',
  expandableButton: ({ active }) => mdiButtonState(icon, { active, title }),
  buttons: themeModeButtons,
};
host: { button: chrome }, // auto: launcher; options L/R by position
toolbar: chrome,          // strip: launcher + secondary row
```

## Kinds

### `single`

```ts
{
  kind: 'single', // optional default
  id: 'mapHomeControl',
  getState: () => mdiButtonState(path, { title: 'Home' }),
  onClick: (e) => { … },
}
```

### `module`

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

Primary row shows a **launcher** from `expandableButton({ active })`. Options live on a **secondary** row (strip) or beside the launcher (host auto, L/R by corner).

```ts
{
  kind: 'module-expandable',
  moduleId: 'mapThemeControl',
  closeOnOutsideClick: true, // default
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
| Click launcher    | `toggleExpandedModule(moduleId)` via `handleToolbarButtonClick` / host strategy      |
| Strip secondary   | Option buttons of that module (+ close control in ToolbarControl)                    |
| Host auto         | Options to the right on `*-left`, to the left on `*-right`                           |
| Close             | Escape / outside when `closeOnOutsideClick !== false`                                |

Stamps: launcher `role: 'launcher'`, `expandable: true`; options `role: 'option'`, `expandable: true`.

## Shared helpers

| Helper                                                                    | Use                                                 |
| ------------------------------------------------------------------------- | --------------------------------------------------- |
| `mapToolbarOptions` / `withLayoutToolbarOptions`                          | Map UI state across all buttons                     |
| `createHostStrategy` / `createLiveToolbarStrategy`                        | Adapter + shared engine                             |
| `planToolbarLayout` / `planToolbarExpansion`                              | Overflow / primary vs secondary                     |
| `handleToolbarButtonClick` / `shouldCloseExpandedOnOutsideClick`          | Launcher toggle vs option `action`                  |

Mount `ToolbarControl` when any control uses `controlLayout: 'toolbar'` or mobile `buttonInMobile: 'toolbar' | 'menu'`.
