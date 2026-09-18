/**
 * Framework-agnostic MeasurementControl orchestration:
 * mode toggle, Measure* actions, views, click → coordinates.
 * Hosts keep toolbar / registry / EventClick / image registration / UI popup.
 */

import { convertGeometry, fitBounds } from '../utils/fillBound';
import type { CoordinatesNumber, MapSimple } from '../types';
import type { CrsItem } from '../crs/types';
import {
  MEASUREMENT_DEFAULT_HIGHLIGHT_COLOR,
  createMeasurementMapView,
} from './map-view-layers';
import { resolveMeasurementModeToggle } from './mode';
import { MeasurementHandle, type MeasurementHandleInstance } from './model/handle';
import { MeasureAngle } from './model/MeasureAngle';
import { MeasureArea } from './model/MeasureArea';
import { MeasureAzimuth } from './model/MeasureAzimuth';
import { MeasureDistance } from './model/MeasureDistance';
import { MeasurePoint } from './model/MeasurePoint';
import { MeasureRadius } from './model/MeasureRadius';
import { FormView } from './model/viewForm';
import { MapMarkerView } from './model/viewMapMarker';
import type { IViewSettingField } from './types';

export type MeasurementModeType =
  | 'distance'
  | 'area'
  | 'azimuth'
  | 'angle'
  | 'radius'
  | 'point';

export type MeasurementUiState = {
  measurementType: string | undefined;
  coordinates: CoordinatesNumber[];
  setting: {
    show: boolean;
    fields: IViewSettingField[];
    maxLength?: number;
  };
};

export type MeasurementSessionOptions = {
  callMap: (fn: (map: MapSimple) => void | Promise<void>) => void;
  getMeasurePointCrsItems?: () => CrsItem[];
  translate?: (
    key: string,
    params?: Record<string, string | number>,
  ) => string;
  onStateChange?: (state: MeasurementUiState) => void;
  /** Host wires EventClick when map view starts / resets. */
  onEventClickActive?: (active: boolean) => void;
  /** Defer restart after reset (Vue `nextTick` / React `queueMicrotask`). */
  scheduleRestart?: (fn: () => void) => void;
};

export type MeasurementSession = {
  getState: () => MeasurementUiState;
  getHandler: () => MeasurementHandleInstance;
  /** Toggle / start a measure mode. Returns false when the mode was cleared. */
  startMode: (type: MeasurementModeType) => boolean;
  reset: (restart?: boolean) => void;
  clear: () => void;
  toggleSetting: () => void;
  setSettingShow: (show: boolean) => void;
  setCoordinates: (coords: CoordinatesNumber[]) => void;
  addMapClick: (lng: number, lat: number) => void;
  flyTo: () => void;
  /** Wire MapView / MarkerView / FormView after the host registered SDF images. */
  attachToMap: (map: MapSimple) => void;
  refreshPointCrs: () => void;
  destroy: () => void;
};

function cloneState(state: MeasurementUiState): MeasurementUiState {
  return {
    measurementType: state.measurementType,
    coordinates: state.coordinates.slice(),
    setting: {
      show: state.setting.show,
      maxLength: state.setting.maxLength,
      fields: state.setting.fields.map((f) => ({ ...f })),
    },
  };
}

function createMeasureAction(
  type: MeasurementModeType,
  getCrs: () => CrsItem[],
) {
  switch (type) {
    case 'distance':
      return new MeasureDistance();
    case 'area':
      return new MeasureArea();
    case 'azimuth':
      return new MeasureAzimuth();
    case 'angle':
      return new MeasureAngle();
    case 'radius':
      return new MeasureRadius();
    case 'point':
      return new MeasurePoint(getCrs);
  }
}

/**
 * Owns MeasurementControl mode + geometry lifecycle. Hosts keep chrome UI.
 */
export function createMeasurementSession(
  options: MeasurementSessionOptions,
): MeasurementSession {
  const handler = MeasurementHandle();
  const state: MeasurementUiState = {
    measurementType: undefined,
    coordinates: [],
    setting: {
      show: true,
      fields: [],
      maxLength: 0,
    },
  };

  const scheduleRestart =
    options.scheduleRestart ?? ((fn) => queueMicrotask(fn));

  function emit() {
    options.onStateChange?.(cloneState(state));
  }

  function getCrsItems(): CrsItem[] {
    return options.getMeasurePointCrsItems?.() ?? [];
  }

  function t(key: string, params?: Record<string, string | number>) {
    return options.translate?.(key, params) ?? key;
  }

  function reset(restart = true) {
    handler.reset();
    if (restart) {
      scheduleRestart(() => handler.start());
    }
  }

  function clear() {
    reset(false);
    state.measurementType = undefined;
    handler.setAction(null);
    emit();
  }

  function startMode(type: MeasurementModeType): boolean {
    reset(false);
    const toggle = resolveMeasurementModeToggle(state.measurementType, type);
    if (!toggle.start) {
      state.measurementType = undefined;
      handler.setAction(null);
      emit();
      return false;
    }
    state.measurementType = toggle.nextType;
    state.setting.show = true;
    handler.setAction(createMeasureAction(type, getCrsItems));
    handler.start();
    emit();
    return true;
  }

  function toggleSetting() {
    state.setting.show = !state.setting.show;
    emit();
  }

  function setSettingShow(show: boolean) {
    state.setting.show = show;
    emit();
  }

  function setCoordinates(coords: CoordinatesNumber[] = []) {
    handler.init(coords);
  }

  function addMapClick(lng: number, lat: number) {
    if (!handler.action) return;
    handler.add([lng, lat]);
  }

  function flyTo() {
    options.callMap((map) => {
      const geometry = convertGeometry(state.coordinates);
      if (geometry) fitBounds(map, geometry);
    });
  }

  function refreshPointCrs() {
    if (state.measurementType !== 'point') return;
    const action = handler.action;
    if (action instanceof MeasurePoint) {
      action.setCrsItems(getCrsItems());
      if (state.coordinates.length) handler.init(state.coordinates);
    }
  }

  function attachToMap(map: MapSimple) {
    const mapId = map.id;
    if (!mapId) return;
    handler.setMapId(mapId);

    const mapView = createMeasurementMapView(map);
    mapView.onStart = () => {
      options.onEventClickActive?.(true);
    };
    mapView.onReset = () => {
      options.onEventClickActive?.(false);
    };

    const markerView = new MapMarkerView(map);
    markerView.setColor(MEASUREMENT_DEFAULT_HIGHLIGHT_COLOR);
    markerView.onDragMarker = (coords) => {
      handler.init(coords);
    };
    markerView.onRightClickMarker = (_coord, index) => {
      const next = state.coordinates.slice();
      next.splice(index, 1);
      state.coordinates = next;
      handler.init(next);
      emit();
    };

    const formView = new FormView();
    formView.onChangeValue = (valueCoordinates) => {
      state.coordinates = (valueCoordinates || []).slice();
      emit();
    };
    formView.onChangeSetting = (setting = {}) => {
      let fields = setting.fields;
      if (!fields || fields.length === 0) {
        fields = [
          {
            text: t('map.measurement.no-data.text'),
            value: t('map.measurement.no-data.value'),
          },
        ];
      }
      state.setting.maxLength = setting.maxLength || 0;
      state.setting.fields = fields.map((x) => ({
        ...x,
        text: x.trans ? t(x.trans, x.params) : x.text,
      }));
      emit();
    };

    handler.addView(mapView);
    handler.addView(markerView);
    handler.addView(formView);
  }

  function destroy() {
    handler.destroy();
    state.measurementType = undefined;
    state.coordinates = [];
    state.setting = { show: true, fields: [], maxLength: 0 };
    handler.setAction(null);
    options.onEventClickActive?.(false);
    emit();
  }

  return {
    getState: () => cloneState(state),
    getHandler: () => handler,
    startMode,
    reset,
    clear,
    toggleSetting,
    setSettingShow,
    setCoordinates,
    addMapClick,
    flyTo,
    attachToMap,
    refreshPointCrs,
    destroy,
  };
}
