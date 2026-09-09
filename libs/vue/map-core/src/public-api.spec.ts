/**
 * Locks `@hungpvq/vue-map-core` root **runtime** export surface.
 * Type-only first-party exports use explicit `export type { … }` (see stable-api.md);
 * do not re-export third-party (`geojson` / `maplibre-gl`) types from the root.
 * Runtime type-only symbols are erased and omitted from this lock.
 *
 * Root `index.ts` must use **named** exports only (no public `export *`).
 * Adding a runtime symbol: named export in `index.ts` + Stable or Experimental list here + stable-api.md.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

/** Stable root runtime exports (SemVer contract for 1.x). */
export const VUE_MAP_CORE_STABLE_RUNTIME_EXPORTS = [
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
  'getStore',
  'GlobeControl',
  'GotoControl',
  'HomeControl',
  'InfoControl',
  'langStore',
  'LegendControl',
  'makeShowProps',
  'Map',
  'MapCommonButton',
  'MapContextMenuControl',
  'MapControlButton',
  'MapControlGroupButton',
  'MeasurementControl',
  'MeasurementSettingPopup',
  'ModuleContainer',
  'MouseCoordinatesControl',
  'PrintAdvancedControl',
  'PrintControl',
  'RegistryControl',
  'RegistryItem',
  'SettingControl',
  'ThemeControl',
  'ToolbarControl',
  'UniversalRegistry',
  'useBaseMap',
  'useBaseMapAdapter',
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
  'withMapProps',
  'WorkerControl',
  'ZoomControl',
] as const;

/** @experimental — may change in a minor. Field/UI helpers not part of the map shell contract. */
export const VUE_MAP_CORE_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'BaseButton',
  'BaseCollapse',
  'Collapse',
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
  'KEY',
  'MapButton',
  'MapCard',
  'MapErrorToast',
  'MapIcon',
  'MapImage',
  'MITT_KEY',
] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable + Experimental allowlists', () => {
    const keys = Object.keys(api).sort();
    const expected = [...VUE_MAP_CORE_STABLE_RUNTIME_EXPORTS, ...VUE_MAP_CORE_EXPERIMENTAL_RUNTIME_EXPORTS].sort();
    expect(keys).toEqual(expected);
  });
});
