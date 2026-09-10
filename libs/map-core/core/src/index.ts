/**
 * Root barrel: explicit named exports (Stable) for the map platform shell.
 * Domain APIs live on subpath entries: `@hungpvq/map-core/basemap`, `/crs`,
 * `/event`, `/image`, `/legend`, `/measurement`, `/menu`, `/print`, `/theme`,
 * `/toolbar`, `/worker`.
 * Do not reintroduce `export *`. See libs/map-core/core/docs/core/stable-api.md.
 * Aggregation lives in ./internal-barrel (not a public package entry).
 */
import './style/index.scss';

export {
  Base,
  EMPTY_MAP_VIEW_INFO,
  FallbackResolver,
  GLOBE_CONTROL_LOCALE,
  GOTO_CONTROL_LOCALE,
  HOME_CONTROL_LOCALE,
  INFO_CONTROL_LOCALE,
  MAP_ACTION_LOCALE,
  MAP_CORE_EVENT,
  MAP_LAYER_SEARCH_SELECTOR,
  MAP_MODULE_CONTROL_ID_KEY,
  MAP_STORE_KEY,
  MapError,
  MapErrorHandler,
  MapEventError,
  MapInitializationError,
  MapInitializer,
  MapStoreManager,
  MittTypeMapEventKey,
  MittTypeMapLangEventKey,
  REGISTRY_CONTROL_LOCALE,
  REGISTRY_GLOBAL_STORE_KEY,
  REGISTRY_NAMESPACES,
  SETTING_CONTROL_LOCALE,
  UniversalRegistry,
  WORKER_CONTROL_LOCALE,
  WorkerMonitor,
} from './internal-barrel';

export {
  applyWorkerMonitorMessage,
  bboxFromGeojson,
  bindMapKeyboardShortcuts,
  closeTopOpenMapControl,
  connectWorkerMonitor,
  convertGeometry,
  copyText,
  createDefaultLangStore,
  createMapMitt,
  createWorkerMonitorLogMessage,
  createWorkerMonitorProgressMessage,
  deepMergeLocale,
  deg_to_dms,
  deg_to_dms_string,
  degToDms,
  degToDmsString,
  dms_to_des,
  dmsToDeg,
  downloadDataUrl,
  errorHandler,
  filterMapControls,
  filterWorkerSnapshots,
  fitBounds,
  focusMapLayerSearch,
  formatCoordinate,
  formatCoordPair,
  formatDegree,
  formatLngLatBounds,
  formatNumber,
  formatProjectionName,
  formatWorkerDuration,
  formatWorkerLogTime,
  GeoLocateSession,
} from './internal-barrel';

export {
  getChartRandomColor,
  getMap,
  hasMapInstance,
  installGlobalErrorCapture,
  isCallStackOverflow,
  isCoordinatesNumber,
  isMapButtonFluidVariant,
  isMapButtonSize,
  isMapButtonSizeName,
  isMapButtonSquareVariant,
  isMapButtonVariant,
  isWorkerBusy,
  isWorkerMonitorLogMessage,
  isWorkerMonitorProgressMessage,
  latDMS,
  lngDMS,
  logHelper,
  MAP_BUTTON_SIZE_PX,
  MAP_BUTTON_SIZES,
  MAP_BUTTON_VARIANTS,
  mapButtonSizeClass,
  mapButtonVariantClass,
  mergeFilters,
  readMapViewInfo,
  registerMapAccessor,
  reprojectGeojsonToWgs84,
  resolveMapButtonSizeName,
  resolveMapButtonSizePx,
  resolveSelectedWorkerId,
  runMapControlAction,
  runMonitoredTask,
  runWorkerMonitor,
  toCoordinatesNumberList,
  toPlainJson,
  workerLogsForDisplay,
  workerProgressRatio,
} from './internal-barrel';

/** First-party types only — do not re-export geojson / maplibre-gl types from the root. */
export type {
  Color,
  Coordinates,
  CoordinatesNumber,
  DraftCoordinatesNumber,
  MapFCOnUseMap,
  MapLangLocale,
  MapLocateStore,
  MapSimple,
  MapTranslateFunction,
  MittTypeMap,
  MittTypeMapLang,
  Position,
  WithMapPropType,
} from './types';
export type {
  MapControlAction,
  MapControlActionMeta,
  MapControlHandle,
  MapControlPanelKind,
  MapControlPanelPosition,
  RegistryNamespaceKind,
} from './registry';
export type {
  AddStoreOptions,
  IMapStoreAdapter,
  LoggerFunction,
  MapRootStore,
  MapStore,
} from './store';
export type { ErrorHandlerOptions } from './services/error-handler.service';
export type { MapEventCallbacks } from './services/map-initializer.service';
export type {
  GeoLocateControlOptions,
  GeoLocateFitBoundsOptions,
  GeoLocatePermissions,
  GeoLocatePermissionStatus,
  GeoLocateSessionOptions,
  GeoLocateUiState,
  GeoLocateWatchState,
} from './geolocate';
export type { GeojsonBbox } from './utils/fillBound';
export type { MapViewInfo } from './utils/map-info';
export type {
  WorkerLogEntry,
  WorkerRuntimeStatus,
  WorkerSnapshot,
  WorkerTaskSnapshot,
} from './worker/types';
export type {
  MapButtonSize,
  MapButtonSizeName,
  MapButtonVariant,
} from './ui/map-button';
