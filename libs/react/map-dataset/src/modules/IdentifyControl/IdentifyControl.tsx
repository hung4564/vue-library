import { type WithMapPropType } from '@hungpvq/map-core';
import type { EventBboxRangerHandle } from '@hungpvq/map-core/event';
import { EventBboxRanger, EventClick } from '@hungpvq/map-core/event';
import type { MapMenuItemProps } from '@hungpvq/map-core/menu';
import { MAP_CONTEXT_MENU_ID } from '@hungpvq/map-core/menu';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  bindHighlightMittBridge,
  emitHighlightIdentifyClose,
} from '@hungpvq/map-dataset/highlight';
import type { IIdentifyView } from '@hungpvq/map-dataset/identify';
import {
  createIdentifySession,
  IDENTIFY_CONTROL,
  IDENTIFY_RESULT_CONTROL,
  type IdentifyLayerFilterPayload,
  type IdentifyResultUpdatePayload,
  type IdentifyScopeToggleResult,
  syncIdentifyPointerPick,
} from '@hungpvq/map-dataset/identify';
import {
  defaultMapProps,
  ModuleContainer,
  UniversalRegistry,
  useEventMap,
  useLang,
  useMap,
  useMapControl,
  useShow,
} from '@hungpvq/react-map-core';
import { mdiHandPointingUp } from '@mdi/js';
import type { MapMouseEvent } from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useEnsureDatasetBuiltinLocales } from '../../extra/lang/ensure-builtin-locales';
import { useMapDataset } from '../../store/dataset-api';
import { IdentifyResultControl } from './IdentifyResultControl';

function updateResultPanel(
  mapId: string,
  payload: IdentifyResultUpdatePayload,
) {
  UniversalRegistry.runControlAction(
    mapId,
    IDENTIFY_RESULT_CONTROL.id,
    IDENTIFY_RESULT_CONTROL.actionUpdate,
    payload,
  );
}

export function IdentifyControl(
  props: WithMapPropType & {
    show?: boolean;
    immediately?: boolean;
  },
) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, order, callMap } = useMap(merged);
  const { getAllComponentsByType, datasetVersion } = useMapDataset(mapId);
  const { trans } = useLang(mapId);
  useEffect(() => bindHighlightMittBridge(mapId), [mapId]);
  useEnsureDatasetBuiltinLocales(mapId);

  const [show, toggleShow] = useShow(!!props.show);
  const [views, setViews] = useState<IIdentifyView[]>([]);
  const [loading, setLoading] = useState(false);

  const viewsRef = useRef(views);
  viewsRef.current = views;
  const showRef = useRef(show);
  showRef.current = show;
  const immediatelyRef = useRef(!!props.immediately);
  immediatelyRef.current = !!props.immediately;
  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  const transRef = useRef(trans);
  transRef.current = trans;
  const callMapRef = useRef(callMap);
  callMapRef.current = callMap;
  const toggleShowStateRef = useRef(toggleShow);
  toggleShowStateRef.current = toggleShow;
  const controlSyncRef = useRef<() => void>(() => undefined);
  const syncResultPanelRef = useRef<
    (extra?: IdentifyResultUpdatePayload) => void
  >(() => undefined);

  const onMapClickRef = useRef<(e: MapMouseEvent) => void>(() => undefined);
  const onBboxSelectRef = useRef<EventBboxRangerHandle>(() => undefined);

  const clickEvent = useMemo(
    () =>
      new EventClick().setHandler((e: MapMouseEvent) => {
        onMapClickRef.current(e);
      }),
    [],
  );
  const bboxEvent = useMemo(
    () =>
      new EventBboxRanger().setHandler((bbox) => {
        onBboxSelectRef.current(bbox);
      }),
    [],
  );

  const {
    add: addEventClick,
    remove: removeEventClick,
    isActive: isEventClickActive,
  } = useEventMap(mapId, clickEvent, false);
  const {
    add: addEventBbox,
    remove: removeEventBbox,
    isActive: isEventClickBox,
  } = useEventMap(mapId, bboxEvent, false);

  const addEventClickRef = useRef(addEventClick);
  addEventClickRef.current = addEventClick;
  const removeEventClickRef = useRef(removeEventClick);
  removeEventClickRef.current = removeEventClick;
  const addEventBboxRef = useRef(addEventBbox);
  addEventBboxRef.current = addEventBbox;
  const removeEventBboxRef = useRef(removeEventBbox);
  removeEventBboxRef.current = removeEventBbox;
  const isEventClickActiveRef = useRef(isEventClickActive);
  isEventClickActiveRef.current = isEventClickActive;
  const isEventClickBoxRef = useRef(isEventClickBox);
  isEventClickBoxRef.current = isEventClickBox;

  const sessionRef = useRef<ReturnType<typeof createIdentifySession> | null>(
    null,
  );
  if (!sessionRef.current) {
    sessionRef.current = createIdentifySession({
      mapId,
      getIdentifies: () => viewsRef.current,
      immediately: () => immediatelyRef.current,
      callMap: (fn) => callMapRef.current(fn),
      translateAllLayers: () => transRef.current('map.identify.all_layers'),
      onStateChange: () => {
        const s = sessionRef.current!.getState();
        toggleShowStateRef.current(s.show);
        showRef.current = s.show;
        setLoading(s.loading);
        loadingRef.current = s.loading;
        controlSyncRef.current();
      },
      setCursor: (cursor) => {
        callMapRef.current((map) => {
          map.getCanvas().style.cursor = cursor;
        });
      },
      syncResultPanel: (extra) => syncResultPanelRef.current(extra),
      onEventClickActive: (active) => {
        syncIdentifyPointerPick(mapId, active);
        if (active) addEventClickRef.current();
        else removeEventClickRef.current();
      },
      onEventBoxSelectActive: (active) => {
        if (active) addEventBboxRef.current();
        else removeEventBboxRef.current();
      },
      getEventClickActive: () => isEventClickActiveRef.current,
      getEventBoxSelectActive: () => isEventClickBoxRef.current,
      onCloseSideEffects: () => {
        const filterId = sessionRef.current?.getState().filterIdentifyId;
        const dataset = filterId
          ? viewsRef.current.find((view) => view.id === filterId)
          : undefined;
        emitHighlightIdentifyClose(mapId, {
          ...(dataset ? { dataset } : {}),
        });
        syncIdentifyPointerPick(mapId, false);
      },
    });
    if (props.show) sessionRef.current.setShow(true);
  }
  const session = sessionRef.current;

  onMapClickRef.current = (e) => session.onMapClick(e);
  onBboxSelectRef.current = (bbox) => session.onBboxSelected(bbox);

  const syncFromModel = useCallback(() => {
    const s = session.getState();
    toggleShow(s.show);
    showRef.current = s.show;
    setLoading(s.loading);
    loadingRef.current = s.loading;
  }, [session, toggleShow]);

  const syncResultPanel = useCallback(
    (extra?: IdentifyResultUpdatePayload) => {
      updateResultPanel(mapId, session.buildResultPanelPayload(extra));
    },
    [mapId, session],
  );
  syncResultPanelRef.current = syncResultPanel;

  useEffect(() => {
    const next = (
      getAllComponentsByType<IIdentifyView>('identify') || []
    ).reverse();
    setViews((prev) => {
      if (
        prev.length === next.length &&
        prev.every((view, index) => view === next[index])
      ) {
        return prev;
      }
      return next;
    });
  }, [datasetVersion, mapId, getAllComponentsByType]);

  useEffect(() => {
    syncResultPanel();
  }, [views, show, loading, syncResultPanel]);
  useEffect(() => {
    syncResultPanelRef.current?.({
      isEventClickActive,
      isEventClickBox,
    });
  }, [isEventClickActive, isEventClickBox]);

  useEffect(() => {
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      MAP_CONTEXT_MENU_ID.identifyHere,
      (menuProps: MapMenuItemProps) => {
        const { lng, lat } = menuProps.layer.lngLat;
        const point = menuProps.layer.point;
        session.onIdentifyHere(
          lng,
          lat,
          point ? [point.x, point.y] : undefined,
        );
      },
    );
    return () => {
      UniversalRegistry.unregisterMenuHandlerForMap(
        mapId,
        MAP_CONTEXT_MENU_ID.identifyHere,
      );
    };
  }, [mapId, session]);

  useEffect(() => {
    return () => {
      sessionRef.current?.teardownInputModes({ immediate: true });
      sessionRef.current?.destroy();
      sessionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (props.immediately) session.toggleMapClickMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleToggle() {
    session.toggleShowAndApply();
    syncFromModel();
  }

  const singleButton = {
    kind: 'single' as const,
    getState: () =>
      mdiButtonState(mdiHandPointingUp, {
        visible: viewsRef.current.length > 0,
        active: showRef.current,
        loading: loadingRef.current,
        title: trans('map.identify.title'),
        order,
      }),
    onClick: () => handleToggle(),
  };

  const { moduleContainerProps, control } = useMapControl(mapId, {
    id: IDENTIFY_CONTROL.id,
    panelKind: 'button',
    title: trans('map.identify.title'),
    from: merged,
    order,
    show,
    setShow: (value) => {
      session.setShow(value);
      syncFromModel();
      updateResultPanel(mapId, { show: value });
    },
    actions: [
      { type: IDENTIFY_CONTROL.id, run: () => handleToggle() },
      {
        type: IDENTIFY_CONTROL.actionSetScoped,
        run: (event) => {
          session.applyScopedAndFinish(
            event as IdentifyScopeToggleResult | undefined,
          );
          syncFromModel();
        },
      },
      {
        type: IDENTIFY_CONTROL.actionUseMapClick,
        run: () => session.toggleMapClickMode(),
      },
      {
        type: IDENTIFY_CONTROL.actionUseBoxSelect,
        run: () => session.toggleBoxSelectMode(),
      },
      {
        type: IDENTIFY_CONTROL.actionSetLayerFilter,
        run: (event) => {
          const payload = event as IdentifyLayerFilterPayload | undefined;
          void session.applyLayerFilter(payload?.identifyId ?? '');
        },
      },
      {
        type: IDENTIFY_CONTROL.actionClose,
        run: () => {
          session.closeAndCleanup();
          syncFromModel();
        },
      },
      {
        type: IDENTIFY_CONTROL.actionSetLoading,
        run: (event) => {
          session.setLoading(!!event);
          syncFromModel();
          control.sync();
        },
      },
      {
        type: IDENTIFY_CONTROL.actionSyncToolbarShow,
        run: (event) => {
          const next = !!event;
          if (session.getState().show === next) return;
          session.setShow(next);
          syncFromModel();
          control.sync();
        },
      },
    ],
    host: { button: singleButton },
    toolbar: singleButton,
  });
  controlSyncRef.current = () => control.sync();

  useEffect(() => {
    control.sync();
  }, [show, loading, views.length, control]);

  return (
    <>
      <ModuleContainer {...moduleContainerProps} />
      <IdentifyResultControl
        position={merged.position}
        controlLayout={merged.controlLayout}
      />
    </>
  );
}
