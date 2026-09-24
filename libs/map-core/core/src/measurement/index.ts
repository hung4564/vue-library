/**
 * Public entry for `@hungpvq/map-core/measurement`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export type { MeasurementGeojsonDownload } from './geojson-download';
export {
  buildMeasurementGeojsonDownload,
  draftCoordinatesToFeature,
} from './geojson-download';
export { MEASUREMENT_CONTROL_LOCALE } from './locale';
export { logger } from './logger';
export type { MeasurementMapViewLayerSpec } from './map-view-layers';
export {
  createMeasurementMapView,
  createMeasurementMapViewEmptySource,
  createMeasurementMapViewLayers,
  MEASUREMENT_DEFAULT_HIGHLIGHT_COLOR,
  MEASUREMENT_MAP_VIEW_IMAGE,
} from './map-view-layers';
export { MeasurementService } from './measurement.service';
export type {
  MeasurementModeType,
  MeasurementSession,
  MeasurementSessionOptions,
  MeasurementUiState,
} from './measurement-session';
export { createMeasurementSession } from './measurement-session';
export type {
  MeasurementModeToggleResult,
  MeasurementToolbarStatus,
} from './mode';
export {
  resolveMeasurementModeToggle,
  resolveMeasurementToolbarStatus,
} from './mode';
export { addCursorCrosshair, removeCursorCrosshair } from './model/cursor';
export type { MeasurementHandleInstance } from './model/handle';
export { MeasurementHandle } from './model/handle';
export { Measure } from './model/Measure';
export { MeasureAngle } from './model/MeasureAngle';
export { MeasureArea } from './model/MeasureArea';
export { MeasureAzimuth } from './model/MeasureAzimuth';
export { MeasureDistance } from './model/MeasureDistance';
export { MeasurePoint } from './model/MeasurePoint';
export { MeasureRadius } from './model/MeasureRadius';
export { View } from './model/view';
export { FormView } from './model/viewForm';
export { MapView } from './model/viewMap';
export { MapMarkerView } from './model/viewMapMarker';
export type {
  IView,
  IViewProps,
  IViewSetting,
  IViewSettingField,
  MeasureActionItem,
  MeasurementHandleType,
} from './types';
export type {
  AreaUnit,
  DistanceUnit,
  MeasurementLabelPrefs,
  MeasurementSettingUiFlags,
} from './utils';
export {
  edgeLabelRotation,
  formatAreaText,
  formatDistanceText,
  getMeasurementAreaUnit,
  getMeasurementDistanceUnit,
  getMeasurementLabelPrefs,
  getMeasurementSettingUiFlags,
  setMeasurementAreaUnit,
  setMeasurementDistanceUnit,
  setMeasurementLabelPrefs,
} from './utils';
