/**
 * Root barrel: explicit named exports (Stable) for the map platform shell.
 * Domain APIs live on subpath entries: `@hungpvq/map-core/basemap`, `/crs`,
 * `/event`, `/image`, `/legend`, `/measurement`, `/menu`, `/print`, `/theme`,
 * `/toolbar`, `/worker`.
 * Do not reintroduce `export *`. See libs/map-core/core/docs/core/stable-api.md.
 * Direct leaf imports (no internal-barrel).
 */
export { DEVTOOLS_CONTROL } from './devtools/control';

export {
  MAP_LAYER_SEARCH_SELECTOR,
} from './a11y/map-keyboard';

export {
  MapError,
  MapEventError,
  MapInitializationError,
} from './errors/index';

export {
  GLOBE_CONTROL_LOCALE,
  GOTO_CONTROL_LOCALE,
  HOME_CONTROL_LOCALE,
  INFO_CONTROL_LOCALE,
  LANGUAGE_CONTROL_LOCALE,
  MAP_ACTION_LOCALE,
  REGISTRY_CONTROL_LOCALE,
  SETTING_CONTROL_LOCALE,
  WORKER_CONTROL_LOCALE,
} from './locale/index';

export { MAP_CORE_LOCALE_EN } from './locale/locale.en';
export { MAP_CORE_LOCALE_VI } from './locale/locale.vi';

export {
  Base,
} from './model/Base';

export {
  MAP_MODULE_CONTROL_ID_KEY,
} from './registry/module-control-id';

export {
  REGISTRY_GLOBAL_STORE_KEY,
  REGISTRY_NAMESPACES,
  UniversalRegistry,
} from './registry/universal-registry';

export {
  FallbackResolver,
} from './resolver/fallback-resolver';

export {
  MapErrorHandler,
} from './services/error-handler.service';

export {
  MapInitializer,
} from './services/map-initializer.service';

export {
  MAP_CORE_EVENT,
  MapStoreManager,
} from './store/store-manager';

export {
  MAP_STORE_KEY,
} from './types/constants';

export {
  MittTypeMapEventKey,
} from './types/store';

export {
  EMPTY_MAP_VIEW_INFO,
} from './utils/map-info';

export {
  WorkerMonitor,
} from './worker/monitor';

export {
  bindMapKeyboardShortcuts,
  closeTopOpenMapControl,
  focusMapLayerSearch,
} from './a11y/map-keyboard';

export {
  GeoLocateSession,
} from './geolocate/session';

export {
  createMapMitt,
} from './mitt/index';

export {
  filterMapControls,
} from './registry/control';

export {
  buildMapControlHandle,
} from './registry/build-map-control-handle';

export {
  errorHandler,
} from './services/error-handler.service';

export {
  MAP_BUILTIN_LANGUAGES,
  MAP_LANGUAGE_STORAGE_KEY,
  MittTypeMapLangEventKey,
  bootstrapMapLanguage,
  createDefaultLangStore,
  createMapLocaleApi,
  deepMergeLocale,
  diffLocaleKeys,
  flattenLocaleMessages,
  getLocaleProp,
  getStoredMapLanguage,
  interpolateLocale,
  isMapLangFlatMessages,
  mapLanguageCodeLabel,
  nextMapLanguageInList,
  registerLanguageControlPacks,
  resolveInitialMapLanguage,
  setStoredMapLanguage,
  translateMapLang,
  translateMapLangFromCatalog,
  unflattenLocaleMessages,
} from './types/lang';

export {
  BUTTON_IN_MOBILE_VALUES,
} from './utils/control-layout';

export {
  degToDms,
  degToDmsString,
  dmsToDeg,
  formatCoordinate,
  parseCoordinateListText,
  parseCoordinateText,
} from './utils/coordinate';

export {
  bboxFromGeojson,
  convertGeometry,
  fitBounds,
} from './utils/fillBound';

export {
  isValidBbox,
} from './utils/bbox';

export {
  DEFAULT_MAP_BREAKPOINTS,
  getMapBreakpointThreshold,
  mapBreakpointGreaterOrEqual,
  mapBreakpointSmallerOrEqual,
  resolveMapBreakpointFlags,
  resolveMapBreakpoints,
} from './utils/breakpoints';

export {
  exitDocumentFullscreen,
  getFullscreenElement,
  isDocumentFullscreen,
  isMapRootFullscreen,
  requestElementFullscreen,
  resolveMapFullscreenTarget,
  subscribeFullscreenChange,
  toggleElementFullscreen,
} from './utils/fullscreen';

export {
  getMapPointerProfile,
} from './utils/pointer-profile';
export type { MapPointerProfile } from './utils/pointer-profile';

export {
  bindMapLongPress,
} from './utils/map-long-press';
export type { MapLongPressOptions } from './utils/map-long-press';

export {
  COPY_FEEDBACK_MS,
  copyText,
  createCopyFeedback,
  downloadDataUrl,
  copyImageDataUrl,
  formatCoordPair,
  formatDegree,
  formatLngLatBounds,
  formatProjectionName,
} from './utils/map-info';
export type { CopyFeedbackController } from './utils/map-info';

export {
  formatNumber,
} from './utils/number';

export {
  abortWorkerMonitorTask,
  connectWorkerMonitor,
} from './worker/client';

export {
  filterWorkerSnapshots,
  formatWorkerDuration,
  formatWorkerLogTime,
} from './worker/format';

export {
  applyWorkerMonitorMessage,
} from './worker/message';

export {
  createWorkerMonitorAbortMessage,
  createWorkerMonitorLogMessage,
  createWorkerMonitorProgressMessage,
} from './worker/protocol';

export {
  runMapControlAction,
} from './registry/control-action';

export {
  installGlobalErrorCapture,
} from './services/global-error-capture';

export {
  getMap,
  registerMapAccessor,
} from './store/index';

export {
  hasMapInstance,
} from './types/store';

export {
  isMapButtonFluidVariant,
  isMapButtonSize,
  isMapButtonSizeName,
  isMapButtonSquareVariant,
  isMapButtonVariant,
  MAP_BUTTON_SIZE_PX,
  MAP_BUTTON_SIZES,
  MAP_BUTTON_VARIANTS,
  mapButtonSizeClass,
  mapButtonVariantClass,
  resolveMapButtonSizeName,
  resolveMapButtonSizePx,
} from './ui/map-button';

export {
  getChartRandomColor,
} from './utils/color';

export {
  resolveControlLayout,
} from './utils/control-layout';

export {
  isCoordinatesNumber,
  latDMS,
  lngDMS,
  toCoordinatesNumberList,
} from './utils/coordinate';

export {
  mergeFilters,
} from './utils/filter';

export {
  isCallStackOverflow,
  reprojectGeojson,
  reprojectGeojsonToWgs84,
  toPlainJson,
} from './utils/geojson-reproject';

export {
  logHelper,
} from './utils/log';

export {
  readMapViewInfo,
} from './utils/map-info';

export {
  isWorkerBusy,
  resolveSelectedWorkerId,
  workerLogsForDisplay,
  workerProgressRatio,
} from './worker/format';

export {
  runWorkerMonitor,
} from './worker/in-worker';

export {
  isWorkerMonitorAbortMessage,
  isWorkerMonitorLogMessage,
  isWorkerMonitorProgressMessage,
} from './worker/protocol';

export {
  runMonitoredTask,
} from './worker/run-task';

/** First-party types only — do not re-export geojson / maplibre-gl types from the root. */
export type { DevtoolsMode } from './devtools/control';
export type {
  ButtonInMobile,
  Color,
  ControlLayout,
  Coordinates,
  CoordinatesNumber,
  DraftCoordinatesNumber,
  MapFCOnUseMap,
  MapLangFlatMessages,
  MapLangLocale,
  MapLanguageCode,
  MapLanguageRegisterOptions,
  MapLoadLocaleOptions,
  MapLocaleLoader,
  MapLocateStore,
  MapSimple,
  MapTranslateFallback,
  MapTranslateFunction,
  MittTypeMap,
  MittTypeMapLang,
  Position,
  WithMapPropType,
} from './types';
export type { ResolvedControlLayout } from './utils/control-layout';
export type {
  MapBreakpointConfig,
  MapBreakpointFlags,
  MapBreakpointName,
} from './utils/breakpoints';
export type {
  MapControlAction,
  MapControlActionMeta,
  MapControlHandle,
  MapControlPanelKind,
  MapControlPanelPosition,
} from './registry/control';
export type { BuildMapControlHandleInput } from './registry/build-map-control-handle';
export type { RegistryNamespaceKind } from './registry/universal-registry';
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
  GeoLocatePermissions,
  GeoLocatePermissionStatus,
  GeoLocateSessionOptions,
  GeoLocateUiState,
} from './geolocate/session';
export type {
  GeoLocateFitBoundsOptions,
  GeoLocateWatchState,
} from './geolocate/viewport';
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
