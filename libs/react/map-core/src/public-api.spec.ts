/**
 * Locks `@hungpvq/react-map-core` root and `./fields` **runtime** export surfaces.
 * Type-only first-party exports use explicit `export type { … }` (see stable-api.md);
 * do not re-export third-party (`geojson` / `maplibre-gl`) types from any entry.
 *
 * Root and fields barrels must use **named** exports only (no public `export *`).
 */
import { describe, expect, it } from 'vitest';
import * as fieldsApi from './fields';
import * as api from './index';

/** Stable root runtime exports (SemVer contract for 1.x). */
export const REACT_MAP_CORE_STABLE_RUNTIME_EXPORTS = [
  'ActionControl',
  'addStore',
  'BaseMapCard',
  'BaseMapControl',
  'BaseMapTagControl',
  'createMapScopedStore',
  'CrsControl',
  'CrsDisplaySettings',
  'DefaultBaseMapAdapter',
  'defaultMapProps',
  'destroyMapScopedStore',
  'EventManagementControl',
  'FullScreenControl',
  'GeoLocateControl',
  'getMapGlobalStore',
  'getMapMittStore',
  'getStore',
  'GlobeControl',
  'GotoControl',
  'HomeControl',
  'InfoControl',
  'langStore',
  'LegendControl',
  'logger',
  'Map',
  'MapCommonButton',
  'MapContext',
  'MapContextMenuControl',
  'MapContextProvider',
  'MapControlButton',
  'MapControlButtonGroupContext',
  'MapControlGroupButton',
  'MapGlobalStoreProvider',
  'MeasurementControl',
  'MeasurementSettingPopup',
  'ModuleContainer',
  'MouseCoordinatesControl',
  'PrintAdvancedControl',
  'PrintControl',
  'ReactMapStoreAdapter',
  'RegistryControl',
  'RegistryItem',
  'SettingControl',
  'ThemeControl',
  'ToolbarControl',
  'UniversalRegistry',
  'useBaseMap',
  'useBaseMapAdapter',
  'useBreakpoints',
  'useComponentName',
  'useCoordinate',
  'useEventListener',
  'useEventMap',
  'useEventMapItems',
  'useInitToolbarControl',
  'useLang',
  'useLayerLegend',
  'useMap',
  'useMapBaseMapStore',
  'useMapContainer',
  'useMapContext',
  'useMapCrsCurrent',
  'useMapCrsDisplayEpsgs',
  'useMapCrsItems',
  'useMapCrsStore',
  'useMapEventStore',
  'useMapGlobalStore',
  'useMapImage',
  'useMapImages',
  'useMapInstance',
  'useMapMittStore',
  'useMapPrint',
  'useMapPrintStore',
  'useMapState',
  'useMapStore',
  'useMapToolbar',
  'useMapToolbarModule',
  'useMapToolbarStore',
  'useRegisterMapControl',
  'useShow',
  'useToolbarControl',
  'useUniversalRegistry',
  'useWorkerMonitor',
  'WorkerControl',
  'ZoomControl',
] as const;

/** Reserved — root Experimental allowlist is empty; field UI is on `./fields`. */
export const REACT_MAP_CORE_EXPERIMENTAL_RUNTIME_EXPORTS = [] as const;

/** Runtime exports of `@hungpvq/react-map-core/fields` (Experimental; may change in a minor). */
export const REACT_MAP_CORE_FIELDS_RUNTIME_EXPORTS = [
  'BaseCollapse',
  'Collapse',
  'DragDropFile',
  'InputCheckbox',
  'InputChoose',
  'InputColorPicker',
  'InputCrs',
  'InputFile',
  'InputSelect',
  'InputSlider',
  'InputText',
  'InputTextArea',
  'InputTextarea',
  'MapButton',
  'MapCard',
  'MapErrorToast',
  'MapIcon',
  'MapImage',
] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable allowlist', () => {
    const keys = Object.keys(api).sort();
    const expected = [
      ...REACT_MAP_CORE_STABLE_RUNTIME_EXPORTS,
      ...REACT_MAP_CORE_EXPERIMENTAL_RUNTIME_EXPORTS,
    ].sort();
    expect(keys).toEqual(expected);
  });

  it('fields entry runtime exports match the fields allowlist', () => {
    const keys = Object.keys(fieldsApi).sort();
    expect(keys).toEqual([...REACT_MAP_CORE_FIELDS_RUNTIME_EXPORTS].sort());
  });
});
