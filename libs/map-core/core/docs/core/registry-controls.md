# UniversalRegistry — map controls

Mounted ModuleContainer controls (popup, sidebar, float, and button-only) register themselves via `UniversalRegistry.registerControl`. The class lives in `@hungpvq/map-core` (bags on `@hungpvq/shared-store`); Vue / React adapters **extend** it with typed component registration only. Methods, menu handlers, components, and control handles share **one store and one resolve path** (`runMapControlAction` included).

Reserved global method keys `MAP_PLATFORM_REGISTRY_METHOD.*` (`__platform.getMap`, `__platform.subscribeMapReady`, `__platform.registerStoreCleanup`) wire map accessors — they are **not** app controls and survive `clearMap`.

Menu / UI components (`registerComponent` / `registerComponentForMap`): [UniversalRegistry components](./registry-components.md).

```ts
import { UniversalRegistry, runMapControlAction } from '@hungpvq/map-core';
// or `@hungpvq/vue-map-core` / `@hungpvq/react-map-core`

UniversalRegistry.openControl(mapId, 'mapLayerControl');
runMapControlAction(mapId, 'mapHomeControl');
```

## List & inspect

```ts
import { UniversalRegistry } from '@hungpvq/vue-map-core';
// or `@hungpvq/react-map-core`

const controls = UniversalRegistry.listControls(mapId);
// [{ id, panelKind, title, props, actions, open, close, runAction, ... }]

UniversalRegistry.getControl('mapLayerControl', mapId)?.props;
UniversalRegistry.getKeysForMap(mapId, 'control');
```

## Open / close / move panel / button layout

```ts
UniversalRegistry.openControl(mapId, 'mapLayerControl');
UniversalRegistry.closeControl(mapId, 'mapGotoControl');

// Panel offsets / sidebar dock (not button corner)
UniversalRegistry.setControlPosition(mapId, 'mapGotoControl', {
  top: 80,
  right: 60,
  width: 360,
  height: 420,
});
UniversalRegistry.setControlPosition(mapId, 'mapLayerControl', {
  location: 'right',
});

// Button layout SoT (visible, corner position, order, controlLayout, buttonInMobile)
UniversalRegistry.setControlLayout(mapId, 'mapHomeControl', {
  visible: false,
  position: 'top-left',
  order: 20,
  controlLayout: 'toolbar',
  buttonInMobile: 'button', // optional per-control override; omit/undefined = inherit Map
});
UniversalRegistry.getControlLayout(mapId, 'mapHomeControl');
// runAction still works while visible:false
UniversalRegistry.runControlAction(mapId, 'mapHomeControl');
```

`setControlPosition` = **panel** offsets/dock. `setControlLayout.position` = **button corner**.

## Popup panel defaults (Map + control)

Mount seed for popup/float panels (sidebar keeps `{ location }` only):

1. Package corner baseline (`top`/`bottom` `50`, `left`/`right` `18+btnWidth`) — see `DEFAULT_POPUP_POSITION_DEFAULTS` / `buildPopupPropsForPosition` (button chrome still uses `top`/`bottom` `10` via `buildModuleBindPosition`)
2. Map `popupPositionDefaults[position]` (partial edges; missing keys keep package baseline)
3. Control `popupProps` (wins)

```vue
<Map>
  <GotoControl position="top-right" />
  <!-- popup opens with top: 50, right: 18+btnWidth -->
  <SettingControl position="bottom-left" />
  <!-- popup opens with bottom: 50, left: 18+btnWidth -->
  <GotoControl position="top-right" :popup-props="{ top: 80 }" />
  <!-- this one top: 80 -->
</Map>
```

```tsx
<Map popupPositionDefaults={{ 'top-right': { top: 80 } }}>
  <GotoControl position="top-right" />
  {/* Map table overrides package top: 50 → 80 */}
</Map>
```

`useMapControl` seeds `panelBind` via `buildPopupPropsForPosition` when `panelKind` is `popup` or `float`. Pass chrome through `from: props` so `popupProps` / `btnWidth` / `position` are picked up. Runtime `UniversalRegistry.setControlPosition` still patches after mount.

```ts
import {
  buildPopupPropsForPosition,
  type MapPopupPanelPosition,
  type MapPopupPositionDefaults,
  type MapPopupProps,
  type MapSidebarPanelPosition,
  type MapSidebarProps,
} from '@hungpvq/map-core';

// popup/float control chrome
popupProps?: MapPopupProps; // edges + optional width/height

// sidebar useMapControl seed
initialPanelPosition?: MapSidebarPanelPosition; // { location: 'left' }
// alias: MapSidebarProps
```

## Run button actions

Single-button controls (Home, Fullscreen, Layer toggle, …):

```ts
UniversalRegistry.runControlAction(mapId, 'mapHomeControl');
// or
UniversalRegistry.runControlAction(mapId, 'mapLayerControl', 'mapLayerControl');
```

Multi-button controls — pass `type`, or omit it to use `defaultActionType`:

```ts
// Uses defaultActionType ('distance' / 'mapZoomIn' / 'mapPrintShow')
UniversalRegistry.runControlAction(mapId, 'mapMeasurementControl');
UniversalRegistry.runControlAction(mapId, 'mapNavigationControl');
UniversalRegistry.runControlAction(mapId, 'mapPrintAdvancedControl');

// Or pass type explicitly
UniversalRegistry.runControlAction(mapId, 'mapNavigationControl', 'mapZoomIn');
UniversalRegistry.runControlAction(mapId, 'mapNavigationControl', 'mapZoomOut');
UniversalRegistry.runControlAction(mapId, 'mapNavigationControl', 'mapCompass');
UniversalRegistry.runControlAction(mapId, 'mapMeasurementControl', 'distance');
UniversalRegistry.runControlAction(mapId, 'mapMeasurementControl', 'setting');
UniversalRegistry.runControlAction(mapId, 'mapPrintAdvancedControl', 'mapPrintShow');
UniversalRegistry.runControlAction(mapId, 'mapPrintAdvancedControl', 'mapPrintSetting');
```

Inspect available action types:

```ts
const ctrl = UniversalRegistry.getControl('mapNavigationControl', mapId);
ctrl?.actions.map((a) => a.type); // ['mapCompass', 'mapZoomIn', 'mapZoomOut']
```

## Control ids (common)

| id                          | Kind    | Notes                                                                |
| --------------------------- | ------- | -------------------------------------------------------------------- |
| `mapLayerControl`           | sidebar |                                                                      |
| `mapDatasetControl`         | sidebar |                                                                      |
| `mapGotoControl`            | popup   |                                                                      |
| `mapSettingControl`         | popup   |                                                                      |
| `mapInfoControl`            | popup   |                                                                      |
| `mapWorkerControl`          | sidebar | Any registered web worker                                            |
| `mapIdentifyControl`        | popup   |                                                                      |
| `mapCrsControl`             | popup   |                                                                      |
| `mapLegendControl`          | popup   |                                                                      |
| `mapBaseMapControl`         | popup   |                                                                      |
| `mapEventManagementControl` | sidebar |                                                                      |
| `mapHomeControl`            | button  |                                                                      |
| `mapFullscreenControl`      | button  |                                                                      |
| `mapThemeControl`           | button  | Toggle light/dark; hover menu for themes                             |
| `mapGeoLocateControl`       | button  |                                                                      |
| `mapGlobeControl`           | button  |                                                                      |
| `mapPrintControl`           | button  |                                                                      |
| `mapNavigationControl`      | button  | multi: `mapCompass`, `mapZoomIn`, `mapZoomOut`                       |
| `mapMeasurementControl`     | button  | multi: `distance`, `area`, …                                         |
| `mapPrintAdvancedControl`   | button  | multi: `mapPrintShow`, `mapPrintSave`, …                             |
| `mapInspectControl`         | button  | Draw packages (Vue + React); Inspect docs under `/map/draw/#inspect` |
| `mapDrawDraftList`          | popup   | Draw draft list when draft mode is on                                |
| `mapRegistryControl`        | popup   | Inspector for registered controls                                    |

Ids match toolbar / module ids where those exist.

Dynamic panels (`mapCreateControl`, `mapAttributeTable`, `mapLayerDetail`, `mapDatasetDetail`, `mapMeasurementSetting`, …) register when opened via UI / `ComponentManagementControl`.

## Demo

Mount [`RegistryControl`](./module/RegistryControl.md) (id `mapRegistryControl`) — or open `#/registry-control` in `apps/vue/demo-map` / `apps/react/demo-map`.

The inspector uses `ModuleContainer` + `DraggableItemPopup` + `useMapControl`, same as other library controls. It can edit layout fields and run actions while a control is hidden.

## Hook (library authors)

Canonical pattern — **`useMapControl` only** (register handle + layout store + toolbar + optional auto-button).

`setShow` **must** accept a boolean (`true` / `false`). `openControl` / `closeControl` call `setShow(true|false)`; do not pass a toggle-only function.

Simple single-button controls omit `#btn` / `btn` — ModuleContainer auto-renders `MapCommonButton` from `getButtonState`. Custom UI passes `buttonSlot: 'custom'` and keeps `#btn`.

```ts
const [show, setShow] = useShow(props.show);

const { mapId, order } = useMap(props);
const { moduleContainerProps, panelBind } = useMapControl(mapId, {
  id: 'mapLayerControl',
  panelKind: 'sidebar', // or 'popup' | 'float' | 'button'
  title: () => 'Layers',
  from: props, // includes position, popupProps, buttonInMobile, …
  order,
  show,
  setShow,
  // Multi-action controls: declare default for runAction() without type
  // defaultActionType: 'distance',
  actions: [{ type: 'mapLayerControl', run: () => setShow(true) }],
  getButtonState: () => mdiButtonState(mdiLayers, { title: 'Layers', order: order.value }),
  onClick: () => setShow(!show.value),
});

// Spread `from: props` (+ `order` from useMap) onto useMapControl — chrome mount
// defaults (incl. Map popupPositionDefaults + control popupProps for popup/float).
// Dual popups: override with an explicit `:id` / `id=` **after** `{...panelBind}`.
```

App usage (same for every demo / page):

```ts
UniversalRegistry.openControl(mapId, 'mapLayerControl');
UniversalRegistry.closeControl(mapId, 'mapLayerControl');
UniversalRegistry.setControlPosition(mapId, 'mapLayerControl', {
  location: 'right',
});
UniversalRegistry.setControlLayout(mapId, 'mapHomeControl', { visible: false });
UniversalRegistry.runControlAction(mapId, 'mapLayerControl');
```

Sidebar panels sync visibility through the draggable store; `setShow(false)` must clear that store entry (handled inside `DraggableItemSideBar` / `useInitSidebar`).
