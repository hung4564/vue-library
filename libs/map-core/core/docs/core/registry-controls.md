# UniversalRegistry — map controls

Mounted ModuleContainer controls (popup, sidebar, float, and button-only) register themselves on the map via `UniversalRegistry.registerControl`. Apps can list them, open/close panels, move panels, and run button actions.

## List & inspect

```ts
import { UniversalRegistry } from '@hungpvq/vue-map-core';
// or `@hungpvq/react-map-core`

const controls = UniversalRegistry.listControls(mapId);
// [{ id, panelKind, title, props, actions, open, close, runAction, ... }]

UniversalRegistry.getControl('mapLayerControl', mapId)?.props;
UniversalRegistry.getKeysForMap(mapId, 'control');
```

## Open / close / move panel

```ts
UniversalRegistry.openControl(mapId, 'mapLayerControl');
UniversalRegistry.closeControl(mapId, 'mapGotoControl');

// Popup / float offsets (pixels from edges)
UniversalRegistry.setControlPosition(mapId, 'mapGotoControl', {
  top: 80,
  right: 60,
});

// Sidebar dock
UniversalRegistry.setControlPosition(mapId, 'mapLayerControl', {
  location: 'right',
});
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

| id | Kind | Notes |
| --- | --- | --- |
| `mapLayerControl` | sidebar | |
| `mapDatasetControl` | sidebar | |
| `mapGotoControl` | popup | |
| `mapSettingControl` | popup | |
| `mapInfoControl` | popup | |
| `mapWorkerControl` | sidebar | Any registered web worker |
| `mapIdentifyControl` | popup | |
| `mapCrsControl` | popup | |
| `mapLegendControl` | popup | |
| `mapBaseMapControl` | popup | |
| `mapEventManagementControl` | sidebar | |
| `mapHomeControl` | button | |
| `mapFullscreenControl` | button | |
| `mapGeoLocateControl` | button | |
| `mapGlobeControl` | button | |
| `mapPrintControl` | button | |
| `mapNavigationControl` | button | multi: `mapCompass`, `mapZoomIn`, `mapZoomOut` |
| `mapMeasurementControl` | button | multi: `distance`, `area`, … |
| `mapPrintAdvancedControl` | button | multi: `mapPrintShow`, `mapPrintSave`, … |
| `mapInspectControl` | button | Vue draw only |
| `mapRegistryControl` | popup | Inspector for registered controls |

Ids match toolbar / module ids where those exist.

Dynamic panels (`mapCreateControl`, `mapAttributeTable`, `mapLayerDetail`, `mapDatasetDetail`, `mapMeasurementSetting`, …) register when opened via UI / `ComponentManagementControl`.


## Demo

Mount [`RegistryControl`](./module/RegistryControl.md) (id `mapRegistryControl`) — or open `#/registry-control` in `apps/vue/demo-map` / `apps/react/demo-map`.

The inspector uses `ModuleContainer` + `DraggableItemPopup` + `useRegisterMapControl`, same as other library controls.

## Hook (library authors)

Canonical pattern — `setShow` **must** accept a boolean (`true` / `false`). `openControl` / `closeControl` call `setShow(true|false)`; do not pass a toggle-only function.

```ts
const [show, setShow] = useShow(props.show);

useRegisterMapControl(mapId, {
  id: 'mapLayerControl',
  panelKind: 'sidebar', // or 'popup' | 'float' | 'button'
  title: () => 'Layers',
  show,
  setShow,
  // Multi-action controls: declare default for runAction() without type
  // defaultActionType: 'distance',
  actions: [{ type: 'mapLayerControl', run: () => setShow() }],
});
```

App usage (same for every demo / page):

```ts
UniversalRegistry.openControl(mapId, 'mapLayerControl');
UniversalRegistry.closeControl(mapId, 'mapLayerControl');
UniversalRegistry.setControlPosition(mapId, 'mapLayerControl', {
  location: 'right',
});
UniversalRegistry.runControlAction(mapId, 'mapLayerControl');
```

Sidebar panels sync visibility through the draggable store; `setShow(false)` must clear that store entry (handled inside `DraggableItemSideBar` / `useInitSidebar`).
