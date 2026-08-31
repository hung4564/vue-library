import {
  EventClick,
  FormView,
  MapMarkerView,
  MapView,
  MeasureArea,
  MeasureAzimuth,
  MeasureDistance,
  MeasurePoint,
  MeasurementHandle,
  convertGeometry,
  fitBounds,
  logHelper,
  type CoordinatesNumber,
  type IViewSettingField,
  type MapSimple,
  type MeasureActionItem,
  type MapControlButtonUIState,
  type MeasurementHandleType,
  type ToolbarButtonConfig,
  type WithMapPropType,
} from '@hungpvq/map-core';
import {
  mdiClose,
  mdiCogOutline,
  mdiCrosshairsGps,
  mdiDeleteOutline,
  mdiMapMarkerOutline,
  mdiRuler,
  mdiRulerSquareCompass,
  mdiTableHeadersEye,
} from '@mdi/js';
import type { MapMouseEvent } from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapCommonButton } from '../../../components/MapCommonButton';
import { MapControlGroupButton } from '../../../components/MapControlGroupButton';
import { defaultMapProps, useMap } from '../../../hooks';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useMapCrsItems } from '../../crs/useMapCrsItems';
import { useEventMap } from '../../event';
import { useMapImage } from '../../image';
import { useLang } from '../../lang';
import { useToolbarControl } from '../../toolbar';
import { logger } from '../logger';
import { MeasurementSettingPopup } from './MeasurementSettingPopup';
import imageArrow from './img/arrow.png';
import imageRounded from './img/rounded.png';

const DEFAULT_COLOR_HIGHLIGHT = '#004E98';

const PATH = {
  distance: mdiRuler,
  area: mdiRulerSquareCompass,
  azimuth: mdiTableHeadersEye,
  point: mdiMapMarkerOutline,
  clear: mdiDeleteOutline,
  close: mdiClose,
  setting: mdiCogOutline,
  fillBound: mdiCrosshairsGps,
};

export interface MeasurementControlProps extends WithMapPropType {
  actions?: MeasureActionItem[];
}

export function MeasurementControl(props: MeasurementControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const handler = useRef(MeasurementHandle());
  const [measurementType, setMeasurementType] = useState<string | undefined>();
  const [coordinates, setCoordinates] = useState<CoordinatesNumber[]>([]);
  const [setting, setSetting] = useState<{
    show: boolean;
    fields: IViewSettingField[];
    maxLength?: number;
  }>({
    show: true,
    fields: [],
    maxLength: 0,
  });

  const measurementTypeRef = useRef(measurementType);
  const coordinatesRef = useRef(coordinates);
  const settingRef = useRef(setting);
  measurementTypeRef.current = measurementType;
  coordinatesRef.current = coordinates;
  settingRef.current = setting;

  const { callMap, mapId, moduleContainerProps, order } = useMap(
    merged,
    onInit,
    onDestroy,
  );
  const crsHandle = useMapCrsItems(mapId);
  const imageHandle = useMapImage(mapId);
  const { trans, setLocaleDefault } = useLang(mapId);
  const controlRef = useRef<{ sync: () => void } | null>(null);
  const addEventClickRef = useRef<() => void>(() => undefined);
  const removeEventClickRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    setLocaleDefault({
      map: {
        measurement: {
          action: {
            clear: 'Clear',
            close: 'Close',
            setting: 'Setting',
            download: 'Download',
            'add-point': 'Add point',
            'fly-to': 'Fill bound',
            add: 'Add',
          },
          title: 'Measurement',
          result: 'Measurement Result',
          field: {
            'unit-distance': 'Unit distance',
            'unit-area': 'Unit area',
          },
          tools: {
            point: 'Measure Point',
            distance: 'Measure Distance',
            area: 'Measure Area',
            azimuth: 'Measure azimuth',
          },
          unit: {
            meter: 'Meter',
            kilometer: 'Kilometer',
            'square-meter': 'Square Meter',
            hecta: 'Hecta',
            'square-kilometer': 'Square Kilometer',
          },
          setting: {
            title: 'Setting',
            field: { data: 'Data' },
            point: 'Point',
            distance: 'Distance',
            area: 'Area',
            azimuth: 'Azimuth',
          },
          'no-data': {
            text: 'Status',
            value: 'Waiting...',
          },
        },
      },
    });
  }, [setLocaleDefault]);

  const clickEvent = useRef(
    new EventClick().setHandler((event: MapMouseEvent) => {
      logHelper(logger, mapId, 'control', 'MeasurementControl').debug(
        'onMapClick',
        event,
      );
      const newCoordinate: CoordinatesNumber = [
        event.lngLat.lng ?? 0,
        event.lngLat.lat ?? 0,
      ];
      if (handler.current.action) handler.current.add(newCoordinate);
    }),
  );

  const { add: addEventClick, remove: removeEventClick } = useEventMap(
    mapId,
    clickEvent.current,
    false,
  );
  addEventClickRef.current = addEventClick;
  removeEventClickRef.current = removeEventClick;

  function reset(restart = true) {
    handler.current.reset();
    if (restart) {
      // Defer like Vue nextTick so views finish reset before start
      queueMicrotask(() => handler.current.start());
    }
  }

  function clear() {
    reset(false);
    setMeasurementType(undefined);
    handler.current.setAction(null);
  }

  function checkMeasureRun(type: string) {
    reset(false);
    if (measurementTypeRef.current === type) {
      setMeasurementType(undefined);
      handler.current.setAction(null);
      return false;
    }
    setMeasurementType(type);
    measurementTypeRef.current = type;
    return true;
  }

  function onMeasureDistance() {
    if (!checkMeasureRun('distance')) return;
    handler.current.setAction(new MeasureDistance());
    handler.current.start();
  }

  function onMeasureArea() {
    if (!checkMeasureRun('area')) return;
    handler.current.setAction(new MeasureArea());
    handler.current.start();
  }

  function onMeasureAzimuth() {
    if (!checkMeasureRun('azimuth')) return;
    handler.current.setAction(new MeasureAzimuth());
    handler.current.start();
  }

  function onMeasureMarker() {
    if (!checkMeasureRun('point')) return;
    handler.current.setAction(new MeasurePoint(crsHandle.items));
    handler.current.start();
  }

  function toggleSetting() {
    setSetting((prev) => {
      const next = { ...prev, show: !prev.show };
      settingRef.current = next;
      return next;
    });
  }

  function onFlyTo() {
    callMap((map) => {
      const geometry = convertGeometry(coordinatesRef.current);
      if (geometry) fitBounds(map, geometry);
    });
  }

  function setValue(coords: CoordinatesNumber[] = []) {
    handler.current.init(coords);
  }

  const clearRef = useRef(clear);
  const onFlyToRef = useRef(onFlyTo);
  const onMeasureDistanceRef = useRef(onMeasureDistance);
  const onMeasureAreaRef = useRef(onMeasureArea);
  const onMeasureAzimuthRef = useRef(onMeasureAzimuth);
  const onMeasureMarkerRef = useRef(onMeasureMarker);
  const resetRef = useRef(reset);
  const toggleSettingRef = useRef(toggleSetting);
  clearRef.current = clear;
  onFlyToRef.current = onFlyTo;
  onMeasureDistanceRef.current = onMeasureDistance;
  onMeasureAreaRef.current = onMeasureArea;
  onMeasureAzimuthRef.current = onMeasureAzimuth;
  onMeasureMarkerRef.current = onMeasureMarker;
  resetRef.current = reset;
  toggleSettingRef.current = toggleSetting;

  const toToolbarButton = useCallback(
    (action: MeasureActionItem): ToolbarButtonConfig => ({
      id: action.type,
      order: action.index,
      getState: () => {
        const status: 'select' | 'handle' = measurementTypeRef.current
          ? 'handle'
          : 'select';
        const visible = action.show
          ? action.show({
              handler: handler.current as unknown as MeasurementHandleType,
              measurementType: measurementTypeRef.current,
              status,
            })
          : status === 'select';

        return {
          visible,
          active: action.isActive?.() ?? false,
          disabled: action.disabled
            ? action.disabled({ coordinates: coordinatesRef.current })
            : false,
          title: trans(action.title),
          icon: {
            type: 'mdi' as const,
            path: action.icon,
          },
        };
      },
      onClick: async () => {
        logHelper(logger, mapId, 'control', 'MeasurementControl').debug(
          'callAction',
          action,
        );
        action.handle({
          handler: handler.current as unknown as MeasurementHandleType,
          measurementType: measurementTypeRef.current,
          coordinates: coordinatesRef.current,
          clear: () => clearRef.current(),
          reset: (...args) => resetRef.current(...args),
          onFlyTo: () => onFlyToRef.current(),
        });
        controlRef.current?.sync();
      },
    }),
    [mapId, trans],
  );

  const buttonShow: MeasureActionItem[] = useMemo(
    () => [
      {
        index: 1,
        type: 'distance',
        title: 'map.measurement.tools.distance',
        icon: PATH.distance,
        handle: () => onMeasureDistanceRef.current(),
        isActive: () => measurementTypeRef.current === 'distance',
      },
      {
        index: 2,
        type: 'area',
        title: 'map.measurement.tools.area',
        icon: PATH.area,
        handle: () => onMeasureAreaRef.current(),
        isActive: () => measurementTypeRef.current === 'area',
      },
      {
        index: 3,
        type: 'azimuth',
        title: 'map.measurement.tools.azimuth',
        icon: PATH.azimuth,
        handle: () => onMeasureAzimuthRef.current(),
        isActive: () => measurementTypeRef.current === 'azimuth',
      },
      {
        index: 4,
        type: 'point',
        title: 'map.measurement.tools.point',
        icon: PATH.point,
        handle: () => onMeasureMarkerRef.current(),
        isActive: () => measurementTypeRef.current === 'point',
      },
    ],
    [],
  );

  const buttonHandle: MeasureActionItem[] = useMemo(
    () => [
      {
        index: 1,
        type: 'setting',
        title: 'map.measurement.action.setting',
        icon: PATH.setting,
        handle: () => toggleSettingRef.current(),
        isActive: () => settingRef.current.show,
        show: ({ status }) => status === 'handle',
      },
      {
        index: 2,
        type: 'fly-to',
        title: 'map.measurement.action.fly-to',
        icon: PATH.fillBound,
        handle: () => onFlyToRef.current(),
        disabled: ({ coordinates: coords }) => !coords || coords.length < 1,
        show: ({ status }) => status === 'handle',
      },
      {
        index: 3,
        type: 'clear',
        title: 'map.measurement.action.clear',
        icon: PATH.clear,
        handle: () => resetRef.current(),
        show: ({ status }) => status === 'handle',
      },
      {
        index: 4,
        type: 'close',
        title: 'map.measurement.action.close',
        icon: PATH.close,
        handle: () => clearRef.current(),
        show: ({ status }) => status === 'handle',
      },
    ],
    [],
  );

  const toolbarConfig = useMemo(
    () => ({
      kind: 'module' as const,
      moduleId: 'mapMeasurementControl',
      moduleOrder: order,
      buttons: [
        ...buttonShow,
        ...buttonHandle,
        ...(props.actions || []),
      ].map(toToolbarButton),
    }),
    [order, buttonShow, buttonHandle, props.actions, toToolbarButton],
  );

  const { state, control } = useToolbarControl(mapId, merged, toolbarConfig);
  controlRef.current = control;

  useEffect(() => {
    control.sync();
  }, [measurementType, coordinates, setting.show, control]);

  function onInit(map: MapSimple) {
    const mapIdForInit = map.id;
    if (!mapIdForInit) return;
    handler.current.setMapId(mapIdForInit);
    imageHandle.addImage(mapIdForInit, 'azimuth-arrow', imageArrow, {
      sdf: true,
    });
    imageHandle.addImage(mapIdForInit, 'measurment-round', imageRounded, {
      content: [4, 4, 12, 12],
      stretchX: [[6, 10]],
      stretchY: [[6, 10]],
    });

    const mapView = new MapView(map);
    mapView.init(
      [
        {
          type: 'line',
          paint: {
            'line-color': DEFAULT_COLOR_HIGHLIGHT,
            'line-width': 2,
          },
        },
        {
          type: 'fill',
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'fill-color': DEFAULT_COLOR_HIGHLIGHT,
            'fill-opacity': 0.3,
          },
        },
        {
          type: 'symbol',
          filter: ['has', 'rotation'],
          paint: { 'icon-color': DEFAULT_COLOR_HIGHLIGHT },
          layout: {
            'icon-size': 1.2,
            'icon-rotate': {
              type: 'identity',
              property: 'rotation',
            },
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-image': 'azimuth-arrow',
            visibility: 'visible',
          },
        },
        {
          type: 'symbol',
          filter: ['all', ['has', 'is_label'], ['==', '$type', 'Point']],
          layout: {
            'text-field': '{text}',
            'text-offset': [
              'case',
              ['to-boolean', ['get', 'is_center']],
              ['literal', [0, 0]],
              ['literal', [0, 2]],
            ],
            'text-size': 14,
            'text-allow-overlap': true,
            'icon-allow-overlap': true,
            'icon-image': 'measurment-round',
            'icon-text-fit': 'both',
          },
          paint: {
            'text-color': '#fff',
            'text-halo-color': DEFAULT_COLOR_HIGHLIGHT,
            'text-halo-width': 2,
          },
        },
      ],
      {
        data: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        },
      },
    );
    mapView.onStart = () => {
      addEventClickRef.current();
    };
    mapView.onReset = () => {
      removeEventClickRef.current();
    };

    const markerView = new MapMarkerView(map);
    markerView.setColor(DEFAULT_COLOR_HIGHLIGHT);
    markerView.onDragMarker = (p_coordinates) => {
      handler.current.init(p_coordinates);
    };
    markerView.onRightClickMarker = (_p_coordinate, index) => {
      const next = coordinatesRef.current.slice();
      next.splice(index, 1);
      setCoordinates(next);
      coordinatesRef.current = next;
      handler.current.init(next);
    };

    const formView = new FormView();
    formView.onChangeValue = (value_coordinates) => {
      const next = (value_coordinates || []).slice();
      coordinatesRef.current = next;
      setCoordinates(next);
    };
    formView.onChangeSetting = (_setting = {}) => {
      let fields = _setting.fields;
      if (!fields || fields.length === 0) {
        fields = [
          {
            text: trans('map.measurement.no-data.text'),
            value: trans('map.measurement.no-data.value'),
          },
        ];
      }
      setSetting((prev) => {
        const next = {
          ...prev,
          maxLength: _setting.maxLength || 0,
          fields: (fields ?? []).map((x) => ({
            ...x,
            text: x.trans ? trans(x.trans) : x.text,
          })),
        };
        settingRef.current = next;
        return next;
      });
    };

    handler.current.addView(mapView);
    handler.current.addView(markerView);
    handler.current.addView(formView);

    logHelper(logger, mapId, 'control', 'MeasurementControl').debug(
      'init',
      handler.current,
    );
  }

  function onDestroy() {
    handler.current.destroy();
    clear();
  }

  const moduleState = state as
    | Record<string, MapControlButtonUIState | undefined>
    | undefined;

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <MapControlGroupButton row className="map-measurement-control">
          {moduleState &&
            Object.entries(moduleState).map(([id, btn]) =>
              btn?.visible ? (
                <MapCommonButton
                  key={id}
                  option={btn}
                  onClick={(e) => {
                    e.stopPropagation();
                    control.onAction(id, e.nativeEvent);
                  }}
                />
              ) : null,
            )}
        </MapControlGroupButton>
      }
    >
      {measurementType ? (
        <MeasurementSettingPopup
          mapId={mapId}
          show={setting.show}
          onUpdateShow={(v) =>
            setSetting((prev) => {
              const next = { ...prev, show: v };
              settingRef.current = next;
              return next;
            })
          }
          value={coordinates}
          onChange={setValue}
          maxLength={setting.maxLength}
          fields={setting.fields}
        />
      ) : null}
    </ModuleContainer>
  );
}
