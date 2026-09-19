import {
  logHelper,
  type MapSimple,
  type WithMapPropType,
} from '@hungpvq/map-core';
import {
  buildMapCrsCatalog,
  resolveCrsDisplayItems,
} from '@hungpvq/map-core/crs';
import { EventClick } from '@hungpvq/map-core/event';
import {
  MEASUREMENT_MAP_VIEW_IMAGE,
  createMeasurementSession,
  resolveMeasurementToolbarStatus,
  type MeasureActionItem,
  type MeasurementHandleType,
  type MeasurementModeType,
  type MeasurementUiState,
  logger,
} from '@hungpvq/map-core/measurement';
import {
  mdiIcon,
  type MapControlButtonUIState,
  type ToolbarButtonConfig,
} from '@hungpvq/map-core/toolbar';
import {
  mdiAngleAcute,
  mdiClose,
  mdiCogOutline,
  mdiCrosshairsGps,
  mdiDeleteOutline,
  mdiMapMarkerOutline,
  mdiRadiusOutline,
  mdiRuler,
  mdiRulerSquareCompass,
  mdiTableHeadersEye,
} from '@mdi/js';
import type { MapMouseEvent } from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapCommonButton } from '../../../components/MapCommonButton';
import { MapControlGroupButton } from '../../../components/MapControlGroupButton';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useMapCrsDisplayEpsgs, useMapCrsItems } from '../../crs/useMapCrsItems';
import { useEventMap } from '../../event/hook/useEvent';
import { useMapImage } from '../../image/store';
import { useLang } from '../../lang/hook';
import { useRegisterMapControl } from '../../registry/useRegisterMapControl';
import { useToolbarControl } from '../../toolbar/helper';
import { MeasurementSettingPopup } from './MeasurementSettingPopup';
import imageArrow from './img/arrow.png';
import imageRounded from './img/rounded.png';

const PATH = {
  distance: mdiRuler,
  area: mdiRulerSquareCompass,
  azimuth: mdiTableHeadersEye,
  angle: mdiAngleAcute,
  radius: mdiRadiusOutline,
  point: mdiMapMarkerOutline,
  clear: mdiDeleteOutline,
  close: mdiClose,
  setting: mdiCogOutline,
  fillBound: mdiCrosshairsGps,
};

export interface MeasurementControlProps extends WithMapPropType {
  actions?: MeasureActionItem[];
}

const INITIAL_UI: MeasurementUiState = {
  measurementType: undefined,
  coordinates: [],
  setting: { show: true, fields: [], maxLength: 0 },
};

export function MeasurementControl(props: MeasurementControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const [ui, setUi] = useState<MeasurementUiState>(INITIAL_UI);
  const uiRef = useRef(ui);
  uiRef.current = ui;

  const sessionRef = useRef<ReturnType<typeof createMeasurementSession> | null>(
    null,
  );
  const addEventClickRef = useRef<() => void>(() => undefined);
  const removeEventClickRef = useRef<() => void>(() => undefined);
  const controlRef = useRef<{ sync: () => void } | null>(null);
  const getMeasurePointCrsItemsRef = useRef<() => ReturnType<typeof resolveCrsDisplayItems>>(
    () => [],
  );
  const translateRef = useRef<(key: string, params?: Record<string, string | number>) => string>(
    (key) => key,
  );

  const { callMap, mapId, moduleContainerProps, order } = useMap(
    { ...merged, controlId: 'mapMeasurementControl' },
    onInit,
    onDestroy,
  );
  const crsHandle = useMapCrsItems(mapId);
  const displayCrsHandle = useMapCrsDisplayEpsgs(mapId);
  const imageHandle = useMapImage(mapId);
  const { trans } = useLang(mapId);
const getMeasurePointCrsItems = useCallback(() => {
    return resolveCrsDisplayItems(
      displayCrsHandle.displayEpsgs,
      buildMapCrsCatalog(crsHandle.items),
    );
  }, [crsHandle.items, displayCrsHandle.displayEpsgs]);
  getMeasurePointCrsItemsRef.current = getMeasurePointCrsItems;
  translateRef.current = (key, params) => trans(key, params);

  const clickEvent = useRef(
    new EventClick().setHandler((event: MapMouseEvent) => {
      logHelper(logger, mapId, 'control', 'MeasurementControl')
        .with({ fn: 'onMapClick', span: 'control.event' })
        .debug('onMapClick', event);
      sessionRef.current?.addMapClick(
        event.lngLat.lng ?? 0,
        event.lngLat.lat ?? 0,
      );
    }),
  );

  const { add: addEventClick, remove: removeEventClick } = useEventMap(
    mapId,
    clickEvent.current,
    false,
  );
  addEventClickRef.current = addEventClick;
  removeEventClickRef.current = removeEventClick;

  if (!sessionRef.current) {
    sessionRef.current = createMeasurementSession({
      callMap,
      getMeasurePointCrsItems: () => getMeasurePointCrsItemsRef.current(),
      translate: (key, params) => translateRef.current(key, params),
      onEventClickActive: (active) => {
        if (active) addEventClickRef.current();
        else removeEventClickRef.current();
      },
      onStateChange: (next) => {
        uiRef.current = next;
        setUi(next);
      },
    });
  }
  const session = sessionRef.current;
  const handler = session.getHandler();

  useEffect(() => {
    session.refreshPointCrs();
  }, [crsHandle.items, displayCrsHandle.displayEpsgs, session]);

  function startMode(type: MeasurementModeType) {
    session.startMode(type);
  }

  const startModeRef = useRef(startMode);
  startModeRef.current = startMode;

  const toToolbarButton = useCallback(
    (action: MeasureActionItem): ToolbarButtonConfig => ({
      id: action.type,
      order: action.index,
      getState: () => {
        const status = resolveMeasurementToolbarStatus(
          uiRef.current.measurementType,
        );
        const visible = action.show
          ? action.show({
              handler: handler as unknown as MeasurementHandleType,
              measurementType: uiRef.current.measurementType,
              status,
            })
          : status === 'select';

        return {
          visible,
          active: action.isActive?.() ?? false,
          disabled: action.disabled
            ? action.disabled({ coordinates: uiRef.current.coordinates })
            : false,
          title: trans(action.title),
          icon: mdiIcon(action.icon),
        };
      },
      onClick: async () => {
        logHelper(logger, mapId, 'control', 'MeasurementControl')
          .with({ fn: 'toToolbarButton', span: 'control.event' })
          .debug('callAction', action);
        action.handle({
          handler: handler as unknown as MeasurementHandleType,
          measurementType: uiRef.current.measurementType,
          coordinates: uiRef.current.coordinates,
          clear: () => session.clear(),
          reset: (...args) => session.reset(...args),
          onFlyTo: () => session.flyTo(),
        });
        controlRef.current?.sync();
      },
    }),
    [handler, mapId, session, trans],
  );

  const buttonShow: MeasureActionItem[] = useMemo(
    () => [
      {
        index: 1,
        type: 'distance',
        title: 'map.measurement.tools.distance',
        icon: PATH.distance,
        handle: () => startModeRef.current('distance'),
        isActive: () => uiRef.current.measurementType === 'distance',
      },
      {
        index: 2,
        type: 'area',
        title: 'map.measurement.tools.area',
        icon: PATH.area,
        handle: () => startModeRef.current('area'),
        isActive: () => uiRef.current.measurementType === 'area',
      },
      {
        index: 3,
        type: 'azimuth',
        title: 'map.measurement.tools.azimuth',
        icon: PATH.azimuth,
        handle: () => startModeRef.current('azimuth'),
        isActive: () => uiRef.current.measurementType === 'azimuth',
      },
      {
        index: 4,
        type: 'angle',
        title: 'map.measurement.tools.angle',
        icon: PATH.angle,
        handle: () => startModeRef.current('angle'),
        isActive: () => uiRef.current.measurementType === 'angle',
      },
      {
        index: 5,
        type: 'radius',
        title: 'map.measurement.tools.radius',
        icon: PATH.radius,
        handle: () => startModeRef.current('radius'),
        isActive: () => uiRef.current.measurementType === 'radius',
      },
      {
        index: 6,
        type: 'point',
        title: 'map.measurement.tools.point',
        icon: PATH.point,
        handle: () => startModeRef.current('point'),
        isActive: () => uiRef.current.measurementType === 'point',
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
        handle: () => session.toggleSetting(),
        isActive: () => uiRef.current.setting.show,
        show: ({ status }) => status === 'handle',
      },
      {
        index: 2,
        type: 'fly-to',
        title: 'map.measurement.action.fly-to',
        icon: PATH.fillBound,
        handle: () => session.flyTo(),
        disabled: ({ coordinates: coords }) => !coords || coords.length < 1,
        show: ({ status }) => status === 'handle',
      },
      {
        index: 3,
        type: 'clear',
        title: 'map.measurement.action.clear',
        icon: PATH.clear,
        handle: () => session.reset(),
        show: ({ status }) => status === 'handle',
      },
      {
        index: 4,
        type: 'close',
        title: 'map.measurement.action.close',
        icon: PATH.close,
        handle: () => session.clear(),
        show: ({ status }) => status === 'handle',
      },
    ],
    [session],
  );

  const toolbarConfig = useMemo(
    () => ({
      kind: 'module' as const,
      moduleId: 'mapMeasurementControl',
      order: order,
      orientation: 'row' as const,
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

  const registerActions = useMemo(
    () =>
      [...buttonShow, ...buttonHandle, ...(props.actions || [])].map(
        (action) => {
          const btn = toToolbarButton(action);
          return {
            type: action.type,
            run: (e: unknown) => btn.onClick?.(e as MouseEvent),
          };
        },
      ),
    [buttonShow, buttonHandle, props.actions, toToolbarButton],
  );

  useRegisterMapControl(mapId, {
    id: 'mapMeasurementControl',
    panelKind: 'button',
    buttonPosition: merged.position,
    defaultActionType: 'distance',
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
    }),
    actions: registerActions,
  });

  useEffect(() => {
    control.sync();
  }, [ui.measurementType, ui.coordinates, ui.setting.show, control]);

  function onInit(map: MapSimple) {
    const mapIdForInit = map.id;
    if (!mapIdForInit) return;
    imageHandle.addImage(
      mapIdForInit,
      MEASUREMENT_MAP_VIEW_IMAGE.azimuthArrow,
      imageArrow,
      { sdf: true },
    );
    imageHandle.addImage(
      mapIdForInit,
      MEASUREMENT_MAP_VIEW_IMAGE.round,
      imageRounded,
      {
        content: [4, 4, 12, 12],
        stretchX: [[6, 10]],
        stretchY: [[6, 10]],
      },
    );
    session.attachToMap(map);
    logHelper(logger, mapId, 'control', 'MeasurementControl')
      .with({ fn: 'onInit', span: 'control.init' })
      .debug('Measurement control handler registered.', handler);
  }

  function onDestroy() {
    session.destroy();
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
              btn && btn.visible !== false ? (
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
      {ui.measurementType ? (
        <MeasurementSettingPopup
          mapId={mapId}
          position={merged.position}
          controlLayout={merged.controlLayout}
          show={ui.setting.show}
          onUpdateShow={(v) => session.setSettingShow(v)}
          value={ui.coordinates}
          onChange={(coords) => session.setCoordinates(coords)}
          maxLength={ui.setting.maxLength}
          fields={ui.setting.fields}
          measurementType={ui.measurementType}
          onRefresh={() => session.setCoordinates(uiRef.current.coordinates)}
        />
      ) : null}
    </ModuleContainer>
  );
}
