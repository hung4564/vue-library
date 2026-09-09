/**
 * Locks `@hungpvq/map-core` **runtime** export surface for the root entry and
 * every domain subpath entry (`/basemap`, `/crs`, `/event`, `/image`, `/legend`,
 * `/measurement`, `/menu`, `/print`, `/theme`, `/toolbar`).
 *
 * Type-only first-party exports use explicit `export type { … }` (see stable-api.md);
 * do not re-export third-party (`geojson` / `maplibre-gl`) types from any entry.
 * Runtime type-only symbols are erased and omitted from these locks.
 *
 * Every public barrel must use **named** exports only (no public `export *`).
 * Adding a runtime symbol: named export in the entry barrel + Stable or
 * Experimental list here + stable-api.md.
 */
import { describe, expect, it } from 'vitest';
import * as basemapApi from './basemap';
import * as crsApi from './crs';
import * as eventApi from './event';
import * as imageApi from './image';
import * as api from './index';
import * as legendApi from './legend';
import * as measurementApi from './measurement';
import * as menuApi from './menu';
import * as printApi from './print';
import * as themeApi from './theme';
import * as toolbarApi from './toolbar';

/** Stable root runtime exports (SemVer contract for 1.x). */
export const MAP_CORE_STABLE_RUNTIME_EXPORTS = [
  'applyWorkerMonitorMessage',
  'Base',
  'bboxFromGeojson',
  'bindMapKeyboardShortcuts',
  'closeTopOpenMapControl',
  'connectWorkerMonitor',
  'convertGeometry',
  'copyText',
  'createDefaultLangStore',
  'createMapMitt',
  'createWorkerMonitorLogMessage',
  'createWorkerMonitorProgressMessage',
  'deepMergeLocale',
  'deg_to_dms',
  'deg_to_dms_string',
  'degToDms',
  'degToDmsString',
  'dms_to_des',
  'dmsToDeg',
  'downloadDataUrl',
  'EMPTY_MAP_VIEW_INFO',
  'errorHandler',
  'FallbackResolver',
  'filterMapControls',
  'filterWorkerSnapshots',
  'fitBounds',
  'focusMapLayerSearch',
  'formatCoordinate',
  'formatCoordPair',
  'formatDegree',
  'formatLngLatBounds',
  'formatNumber',
  'formatProjectionName',
  'formatWorkerDuration',
  'formatWorkerLogTime',
  'getChartRandomColor',
  'getMap',
  'GLOBE_CONTROL_LOCALE',
  'GOTO_CONTROL_LOCALE',
  'hasMapInstance',
  'HOME_CONTROL_LOCALE',
  'INFO_CONTROL_LOCALE',
  'installGlobalErrorCapture',
  'isCallStackOverflow',
  'isCoordinatesNumber',
  'isWorkerBusy',
  'isWorkerMonitorLogMessage',
  'isWorkerMonitorProgressMessage',
  'latDMS',
  'lngDMS',
  'logHelper',
  'MAP_ACTION_LOCALE',
  'MAP_CORE_EVENT',
  'MAP_LAYER_SEARCH_SELECTOR',
  'MAP_MODULE_CONTROL_ID_KEY',
  'MAP_STORE_KEY',
  'MapError',
  'MapErrorHandler',
  'MapEventError',
  'MapInitializationError',
  'MapInitializer',
  'MapStoreManager',
  'mergeFilters',
  'MittTypeMapEventKey',
  'MittTypeMapLangEventKey',
  'readMapViewInfo',
  'registerMapAccessor',
  'REGISTRY_CONTROL_LOCALE',
  'REGISTRY_GLOBAL_STORE_KEY',
  'REGISTRY_NAMESPACES',
  'reprojectGeojsonToWgs84',
  'resolveSelectedWorkerId',
  'runMapControlAction',
  'runMonitoredTask',
  'runWorkerMonitor',
  'SETTING_CONTROL_LOCALE',
  'toCoordinatesNumberList',
  'toPlainJson',
  'UniversalRegistry',
  'WORKER_CONTROL_LOCALE',
  'workerLogsForDisplay',
  'WorkerMonitor',
  'workerProgressRatio',
] as const;

/** Reserved for future experimental root exports (currently empty). */
export const MAP_CORE_EXPERIMENTAL_RUNTIME_EXPORTS = [] as const;

/** Stable runtime exports per domain subpath entry. */
export const MAP_CORE_SUBPATH_RUNTIME_EXPORTS = {
  basemap: [
    'BASEMAP_CONTROL_LOCALE',
    'BASEMAP_PREFIX',
    'BaseMapAdapter',
    'BaseMapLayer',
    'BasemapError',
    'BasemapManager',
    'BasemapService',
    'DefaultBaseMapAdapter',
    'getLowestLayerId',
    'INIT_BASEMAPS',
    'MittTypeBaseMapEventKey',
  ],
  crs: [
    'buildCrsSearchCatalog',
    'buildMapCrsCatalog',
    'createDefaultCrsStore',
    'CRS_CONTROL_LOCALE',
    'DEFAULT_CRS_ITEMS',
    'formatCrsLabel',
    'getCrsInputSuggestions',
    'INITIAL_MAP_CRS_ITEMS',
    'lookupCrsItem',
    'MittTypeMapCrsEventKey',
    'normalizeEpsgCode',
    'resolveCrsDisplayItems',
    'resolveCrsItemForStore',
    'resolveCrsProjection',
    'searchCrsCatalog',
  ],
  event: [
    'createDefaultEventStore',
    'Event',
    'EVENT_CONTROL_LOCALE',
    'EventBboxRanger',
    'EventClick',
    'EventContextMenu',
    'EventManager',
    'EventMouseMove',
    'EventRightClick',
    'MittTypeMapEventEventKey',
    'normalizeEventFrom',
    'startBoxRangerMap',
  ],
  image: [
    'addImageForMap',
    'createDefaultImageStore',
    'loadImage',
    'styleImageToDataURL',
    'toImageDataFromRGBAImage',
  ],
  legend: [
    'cache',
    'Circle',
    'exprHandler',
    'Fill',
    'getLegendName',
    'isDisabledLegendLayer',
    'isSupportGenLayerLegend',
    'LEGEND_CONTROL_LOCALE',
    'LegendService',
    'Line',
    'MapLegend',
    'mapImageToDataURL',
    'Symbol',
  ],
  measurement: [
    'addCursorCrosshair',
    'formatAreaText',
    'formatDistanceText',
    'FormView',
    'MapMarkerView',
    'MapView',
    'Measure',
    'MeasureArea',
    'MeasureAzimuth',
    'MeasureDistance',
    'MEASUREMENT_CONTROL_LOCALE',
    'MeasurementHandle',
    'MeasurementService',
    'MeasurePoint',
    'removeCursorCrosshair',
    'View',
  ],
  menu: [
    'centerMapHere',
    'clearAddGeojsonHereItems',
    'copyMapPointAsGeojson',
    'copyMapPointCoords',
    'copyMapPointWkt',
    'createAddGeojsonHereDef',
    'createBufferHereDef',
    'createDefaultMapContextMenuItems',
    'createMapMenuBuilder',
    'createMapMenuItemProps',
    'createMenuItemCenterMapHere',
    'createMenuItemCopyAsGeojson',
    'createMenuItemCopyCoords',
    'createMenuItemCopyWkt',
    'createMenuItemGoogleEarth',
    'createMenuItemGoogleMaps',
    'createMenuItemIdentifyHere',
    'createMenuItemQuickAnalysis',
    'createMenuItemsAddGeojsonHere',
    'createMenuItemZoomInHere',
    'filterVisibleMapMenuItems',
    'formatMapContextCoords',
    'getDefaultAddGeojsonHereItems',
    'handleMapMenuAction',
    'identifyFeaturesHere',
    'MAP_CONTEXT_MENU_ID',
    'openGoogleEarth',
    'openGoogleMaps',
    'pointFeatureGeojson',
    'pointWkt',
    'resolveMapMenuCondition',
    'setAddGeojsonHereItems',
    'zoomInMapHere',
  ],
  print: [
    'createDefaultPrintStore',
    'createPrintStoreApi',
    'CrosshairManager',
    'exportFile',
    'exportMapbox',
    'exportMapboxWithOptions',
    'Format',
    'getMapBoxCanvas',
    'PRINT_CONTROL_LOCALE',
    'PrintableAreaManager',
    'PrintService',
    'waitMapLoadDone',
  ],
  theme: [
    'applyMapThemeClass',
    'bootstrapMapTheme',
    'cycleMapThemeMode',
    'getMapThemeLocaleKey',
    'getPrefersDark',
    'getStoredMapThemeMode',
    'isMapThemeId',
    'isMapThemeMode',
    'MAP_THEME_CLASS',
    'MAP_THEME_COLOR_SCHEME',
    'MAP_THEME_IDS',
    'MAP_THEME_MODES',
    'MAP_THEME_STORAGE_KEY',
    'normalizeMapThemeModes',
    'resolveMapTheme',
    'setStoredMapThemeMode',
    'THEME_CONTROL_LOCALE',
    'toggleMapThemeLightDark',
  ],
  toolbar: [
    'compassIcon',
    'createDefaultToolbarStore',
    'createSubscribable',
    'createToolbarControl',
    'createToolbarModule',
    'createToolbarModuleApi',
    'createToolbarStoreApi',
    'createToolbarStrategy',
    'mdiButtonState',
    'mdiIcon',
    'TOOLBAR_STRATEGIES',
  ],
} as const;

const SUBPATH_MODULES: Record<
  keyof typeof MAP_CORE_SUBPATH_RUNTIME_EXPORTS,
  Record<string, unknown>
> = {
  basemap: basemapApi,
  crs: crsApi,
  event: eventApi,
  image: imageApi,
  legend: legendApi,
  measurement: measurementApi,
  menu: menuApi,
  print: printApi,
  theme: themeApi,
  toolbar: toolbarApi,
};

describe('public API surface', () => {
  it('root runtime exports match Stable + Experimental allowlists', () => {
    const keys = Object.keys(api).sort();
    const expected = [
      ...MAP_CORE_STABLE_RUNTIME_EXPORTS,
      ...MAP_CORE_EXPERIMENTAL_RUNTIME_EXPORTS,
    ].sort();
    expect(keys).toEqual(expected);
  });

  it.each(
    Object.keys(MAP_CORE_SUBPATH_RUNTIME_EXPORTS) as Array<
      keyof typeof MAP_CORE_SUBPATH_RUNTIME_EXPORTS
    >,
  )('subpath entry `%s` runtime exports match the allowlist', (name) => {
    const keys = Object.keys(SUBPATH_MODULES[name]).sort();
    const expected = [...MAP_CORE_SUBPATH_RUNTIME_EXPORTS[name]].sort();
    expect(keys).toEqual(expected);
  });

  it('root entry does not re-export domain symbols', () => {
    const rootKeys = new Set(Object.keys(api));
    const overlap: string[] = [];
    for (const names of Object.values(MAP_CORE_SUBPATH_RUNTIME_EXPORTS)) {
      for (const name of names) if (rootKeys.has(name)) overlap.push(name);
    }
    expect(overlap).toEqual([]);
  });
});
