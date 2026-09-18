/**
 * Public entry for `@hungpvq/map-core/measurement`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export { MEASUREMENT_CONTROL_LOCALE } from './locale';
export { MeasurementService } from './measurement.service';
export { addCursorCrosshair, removeCursorCrosshair } from './model/cursor';
export { MeasurementHandle } from './model/handle';
export { Measure } from './model/Measure';
export { MeasureArea } from './model/MeasureArea';
export { MeasureAngle } from './model/MeasureAngle';
export { MeasureAzimuth } from './model/MeasureAzimuth';
export { MeasureDistance } from './model/MeasureDistance';
export { MeasurePoint } from './model/MeasurePoint';
export { MeasureRadius } from './model/MeasureRadius';
export { View } from './model/view';
export { FormView } from './model/viewForm';
export { MapView } from './model/viewMap';
export { MapMarkerView } from './model/viewMapMarker';
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
export {
  resolveMeasurementModeToggle,
  resolveMeasurementToolbarStatus,
} from './mode';
export {
  createMeasurementSession,
} from './measurement-session';
export type {
  MeasurementModeType,
  MeasurementSession,
  MeasurementSessionOptions,
  MeasurementUiState,
} from './measurement-session';
export {
  MEASUREMENT_DEFAULT_HIGHLIGHT_COLOR,
  MEASUREMENT_MAP_VIEW_IMAGE,
  createMeasurementMapView,
  createMeasurementMapViewEmptySource,
  createMeasurementMapViewLayers,
} from './map-view-layers';
export {
  buildMeasurementGeojsonDownload,
  draftCoordinatesToFeature,
} from './geojson-download';

export type { MeasurementHandleInstance } from './model/handle';
export type {
  AreaUnit,
  DistanceUnit,
  MeasurementLabelPrefs,
  MeasurementSettingUiFlags,
} from './utils';
export type {
  MeasurementModeToggleResult,
  MeasurementToolbarStatus,
} from './mode';
export type {
  MeasurementMapViewLayerSpec,
} from './map-view-layers';
export type {
  MeasurementGeojsonDownload,
} from './geojson-download';
export type {
  IView,
  IViewProps,
  IViewSetting,
  IViewSettingField,
  MeasureActionItem,
  MeasurementHandleType,
} from './types';
