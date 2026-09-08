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
  'BaseMapControl',
  'BaseMapTagControl',
  'CompareBaseMapControl',
  'CompareSettingControl',
  'CrsControl',
  'EventManagementControl',
  'FullScreenControl',
  'GeoLocateControl',
  'GlobeControl',
  'GotoControl',
  'HomeControl',
  'InfoControl',
  'LegendControl',
  'Map',
  'MapContextMenuControl',
  'MeasurementControl',
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
  'WorkerControl',
  'ZoomControl',
  'useMap',
  'useMapInstance',
  'useRegisterMapControl',
  'useShow',
  'useUniversalRegistry',
] as const;

/** @experimental — may change in a minor. */
export const VUE_MAP_CORE_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'BaseButton',
  'BaseMapCard',
  'Collapse',
  'CompareBaseMapCard',
  'CompareSettingCard',
  'CrsDisplaySettings',
  'DefaultBaseMapAdapter',
  'InputCheckbox',
  'InputChoose',
  'InputColorPicker',
  'InputCrs',
  'InputFile',
  'InputSelect',
  'InputSlider',
  'InputText',
  'InputTextArea',
  'KEY',
  'MITT_KEY',
  'MapButton',
  'MapCard',
  'MapCommonButton',
  'MapCompare',
  'MapControlButton',
  'MapControlGroupButton',
  'MapIcon',
  'MapImage',
  'MeasurementSettingPopup',
  'addStore',
  'createMapScopedStore',
  'defaultMapProps',
  'destroyMapScopedStore',
  'errorHandler',
  'getIsMulti',
  'getLegendName',
  'getMap',
  'getMapCompare',
  'getMapCompareSetting',
  'getMapStore',
  'getMaps',
  'getStore',
  'isDisabledLegendLayer',
  'isSupportGenLayerLegend',
  'langStore',
  'makeShowProps',
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
  'useMapBaseMapStore',
  'useMapContainer',
  'useMapCrsCurrent',
  'useMapCrsDisplayEpsgs',
  'useMapCrsItems',
  'useMapCrsStore',
  'useMapEventStore',
  'useMapGLobalStore',
  'useMapImage',
  'useMapImages',
  'useMapMittStore',
  'useMapPrint',
  'useMapPrintStore',
  'useMapState',
  'useMapStore',
  'useMapToolbar',
  'useMapToolbarModule',
  'useMapToolbarStore',
  'useToolbarControl',
  'useWorkerMonitor',
  'withMapProps',
] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable + Experimental allowlists', () => {
    const keys = Object.keys(api).sort();
    const expected = [...VUE_MAP_CORE_STABLE_RUNTIME_EXPORTS, ...VUE_MAP_CORE_EXPERIMENTAL_RUNTIME_EXPORTS].sort();
    expect(keys).toEqual(expected);
  });
});
