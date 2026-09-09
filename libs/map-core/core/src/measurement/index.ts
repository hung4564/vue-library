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
export { MeasureAzimuth } from './model/MeasureAzimuth';
export { MeasureDistance } from './model/MeasureDistance';
export { MeasurePoint } from './model/MeasurePoint';
export { View } from './model/view';
export { FormView } from './model/viewForm';
export { MapView } from './model/viewMap';
export { MapMarkerView } from './model/viewMapMarker';
export { formatAreaText, formatDistanceText } from './utils';

export type { MeasurementHandleInstance } from './model/handle';
export type {
  IView,
  IViewProps,
  IViewSetting,
  IViewSettingField,
  MeasureActionItem,
  MeasurementHandleType,
} from './types';
