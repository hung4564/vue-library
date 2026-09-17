import { bindMapLongPress, type WithMapPropType } from '@hungpvq/map-core';
import type { EventBboxRangerHandle } from '@hungpvq/map-core/event';
import type { MapMenuItemProps } from '@hungpvq/map-core/menu';
import { EventBboxRanger, EventClick } from '@hungpvq/map-core/event';
import { MAP_CONTEXT_MENU_ID } from '@hungpvq/map-core/menu';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import type { IIdentifyView } from '@hungpvq/map-dataset/identify';
import {
  buildIdentifyResultPanelBase,
  clearIdentifyScope,
  createIdentifyControlModel,
  IDENTIFY_ALL_LAYERS_VALUE,
  IDENTIFY_CONTROL,
  IDENTIFY_CONTROL_LOCALE,
  IDENTIFY_RESULT_CONTROL,
  resolveIdentifyLayerFilterId,
  runIdentifyMulti,
  shouldBindIdentifyLongPress,
  type IdentifyLayerFilterPayload,
  type IdentifyResultUpdatePayload,
  type IdentifyScopeToggleResult,
} from '@hungpvq/map-dataset/identify';
import {
  defaultMapProps,
  MapCommonButton,
  ModuleContainer,
  UniversalRegistry,
  useEventMap,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
  useToolbarControl,
} from '@hungpvq/react-map-core';
import { mdiHandPointingUp } from '@mdi/js';
import type { MapMouseEvent, PointLike } from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMapDataset } from '../../store/dataset-api';
import { useMapHighlight } from '../../store/highlight';
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
    /**
     * Always open Identify Result panel (skip auto show-detail / attribute-table),
     * even when those menus are registered.
     */
    preferResultControl?: boolean;
  },
) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps, order, callMap } = useMap({
    ...merged,
    controlId: IDENTIFY_CONTROL.id,
  });
  const { getAllComponentsByType, datasetVersion } = useMapDataset(mapId);
  const hl = useMapHighlight(mapId);
  const { trans, registerLocale } = useLang(mapId);
  const modelRef = useRef(
    createIdentifyControlModel({ show: !!props.show }),
  );
  const model = modelRef.current;
  const [show, toggleShow] = useShow(model.getState().show);
  const [views, setViews] = useState<IIdentifyView[]>([]);
  /** Local layer filter for IdentifyControl only (not synced with layer-item). */
  const [filterIdentifyId, setFilterIdentifyId] = useState<
    string | undefined
  >(model.getState().filterIdentifyId);
  const [isUseClick, setIsUseClick] = useState(model.getState().isUseClick);
  const [isSelectBbox, setIsSelectBbox] = useState(
    model.getState().isSelectBbox,
  );
  const [origin, setOrigin] = useState(model.getState().origin);
  const [loading, setLoading] = useState(model.getState().loading);

  const viewsRef = useRef(views);
  viewsRef.current = views;
  const filterIdentifyIdRef = useRef(filterIdentifyId);
  filterIdentifyIdRef.current = filterIdentifyId;
  const showRef = useRef(show);
  showRef.current = show;
  const immediatelyRef = useRef(!!props.immediately);
  immediatelyRef.current = !!props.immediately;
  const isUseClickRef = useRef(isUseClick);
  isUseClickRef.current = isUseClick;
  const isSelectBboxRef = useRef(isSelectBbox);
  isSelectBboxRef.current = isSelectBbox;
  const originRef = useRef(origin);
  originRef.current = origin;
  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  const preferResultControlRef = useRef(!!props.preferResultControl);
  preferResultControlRef.current = !!props.preferResultControl;
  const transRef = useRef(trans);
  transRef.current = trans;

  const syncFromModel = useCallback(() => {
    const s = model.getState();
    toggleShow(s.show);
    showRef.current = s.show;
    setLoading(s.loading);
    loadingRef.current = s.loading;
    setFilterIdentifyId(s.filterIdentifyId);
    filterIdentifyIdRef.current = s.filterIdentifyId;
    setIsUseClick(s.isUseClick);
    isUseClickRef.current = s.isUseClick;
    setIsSelectBbox(s.isSelectBbox);
    isSelectBboxRef.current = s.isSelectBbox;
    setOrigin(s.origin);
    originRef.current = s.origin;
  }, [model, toggleShow]);

  useEffect(() => {
    registerLocale('en', IDENTIFY_CONTROL_LOCALE);
  }, [registerLocale]);

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
  const unbindLongPressRef = useRef<(() => void) | null>(null);

  const syncResultPanel = useCallback(
    (extra?: IdentifyResultUpdatePayload) => {
      updateResultPanel(mapId, {
        ...buildIdentifyResultPanelBase({
          loading: loadingRef.current,
          origin: originRef.current,
          views: viewsRef.current,
          allLayersText: transRef.current('map.identify.all_layers'),
          selectedLayerId: filterIdentifyIdRef.current,
          isEventClickActive: isEventClickActiveRef.current,
          isEventClickBox: isEventClickBoxRef.current,
        }),
        ...extra,
      });
    },
    [mapId],
  );

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
  }, [
    views,
    filterIdentifyId,
    show,
    loading,
    origin,
    isEventClickActive,
    isEventClickBox,
    syncResultPanel,
  ]);

  const onGetFeatures = useCallback(
    async (
      pointOrBox: PointLike | [PointLike, PointLike],
      event?: MapMouseEvent,
    ) => {
      model.setLoading(true);
      model.setShow(true);
      syncFromModel();
      // Activate identify session (toolbar) without forcing ResultControl open.
      syncResultPanel({ loading: true });
      callMapRef.current((map) => {
        map.getCanvas().style.cursor = 'wait';
      });
      try {
        const allIdentifies = (
          getAllComponentsByType<IIdentifyView>('identify') || []
        ).reverse();
        viewsRef.current = allIdentifies;
        setViews(allIdentifies);
        await runIdentifyMulti({
          identifies: allIdentifies,
          mapId,
          pointOrBox,
          event,
          filterIdentifyId: filterIdentifyIdRef.current,
          preferResultControl: preferResultControlRef.current,
        });
      } finally {
        model.setLoading(false);
        syncFromModel();
        callMapRef.current((map) => {
          map.getCanvas().style.cursor = '';
        });
        syncResultPanel({ loading: false });
      }
    },
    [mapId, getAllComponentsByType, model, syncFromModel, syncResultPanel],
  );

  const onGetFeaturesRef = useRef(onGetFeatures);
  onGetFeaturesRef.current = onGetFeatures;
  const toggleShowRef = useRef(toggleShow);
  toggleShowRef.current = toggleShow;
  const callMapRef = useRef(callMap);
  callMapRef.current = callMap;
  const syncFromModelRef = useRef(syncFromModel);
  syncFromModelRef.current = syncFromModel;

  useEffect(() => {
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      MAP_CONTEXT_MENU_ID.identifyHere,
      (menuProps: MapMenuItemProps) => {
        const { lng, lat } = menuProps.layer.lngLat;
        const run = (point: PointLike) => {
          model.setOrigin(lat, lng);
          model.setShow(true);
          syncFromModelRef.current();
          void onGetFeaturesRef.current(point);
        };
        if (menuProps.layer.point) {
          run(menuProps.layer.point as PointLike);
          return;
        }
        callMapRef.current((map) => {
          run(map.project([lng, lat]));
        });
      },
    );
  }, [mapId, model]);

  const onStartMapClick = useCallback(() => {
    model.setUseClick(true);
    syncFromModel();
    addEventClickRef.current();
    syncResultPanel({ isEventClickActive: true });
    unbindLongPressRef.current?.();
    unbindLongPressRef.current = null;
    if (shouldBindIdentifyLongPress()) {
      callMapRef.current((map) => {
        unbindLongPressRef.current = bindMapLongPress(map, {
          onLongPress: (point) => {
            if (isEventClickBoxRef.current) return;
            const lngLat = map.unproject([point.x, point.y]);
            model.setOrigin(lngLat.lat, lngLat.lng);
            syncFromModelRef.current();
            void onGetFeaturesRef.current([point.x, point.y]);
          },
        });
      });
    }
  }, [model, syncFromModel, syncResultPanel]);

  const onRemoveMapClick = useCallback(() => {
    model.setUseClick(false);
    syncFromModel();
    removeEventClickRef.current();
    unbindLongPressRef.current?.();
    unbindLongPressRef.current = null;
    syncResultPanel({ isEventClickActive: false });
  }, [model, syncFromModel, syncResultPanel]);

  const onStartBox = useCallback(() => {
    model.setSelectBbox(true);
    syncFromModel();
    addEventBboxRef.current();
    syncResultPanel({ isEventClickBox: true });
  }, [model, syncFromModel, syncResultPanel]);

  const onRemoveBox = useCallback(() => {
    model.setSelectBbox(false);
    syncFromModel();
    window.setTimeout(() => {
      removeEventBboxRef.current();
      syncResultPanel({ isEventClickBox: false });
    }, 500);
  }, [model, syncFromModel, syncResultPanel]);

  const onUseMapClick = useCallback(() => {
    if (!isUseClickRef.current) onStartMapClick();
    else onRemoveMapClick();
  }, [onStartMapClick, onRemoveMapClick]);

  const onUseBoxSelect = useCallback(() => {
    if (!isSelectBboxRef.current) onStartBox();
    else onRemoveBox();
  }, [onStartBox, onRemoveBox]);

  const onRemoveIdentify = useCallback(() => {
    if (immediatelyRef.current) return;
    onRemoveMapClick();
    onRemoveBox();
  }, [onRemoveMapClick, onRemoveBox]);

  const close = useCallback(() => {
    const closed = model.close();
    syncFromModel();
    clearIdentifyScope(mapId);
    onRemoveIdentify();
    hl.hideIfSource('identify');
    syncResultPanel(closed.panel);
  }, [mapId, model, onRemoveIdentify, hl, syncFromModel, syncResultPanel]);

  onMapClickRef.current = (e: MapMouseEvent) => {
    if (isEventClickBoxRef.current) return;
    model.setOrigin(e.lngLat.lat, e.lngLat.lng);
    model.setShow(true);
    syncFromModel();
    onGetFeatures(e.point, e);
  };

  onBboxSelectRef.current = (bbox) => {
    if (isEventClickActiveRef.current) return;
    onRemoveBox();
    if (!bbox) return;
    model.setShow(true);
    syncFromModel();
    onGetFeatures([
      [bbox[0].x, bbox[0].y],
      [bbox[1].x, bbox[1].y],
    ]);
  };

  useEffect(() => {
    if (props.immediately) onUseMapClick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleToggle() {
    const resolved = model.toggleShow();
    syncFromModel();
    syncResultPanel(resolved.panel);
    if (resolved.startMapClick) onStartMapClick();
    else if (resolved.removeIdentify) onRemoveIdentify();
  }

  /** One-way from layer-item: start identify + filter; do not open result popup. */
  function applyScopedSession(result?: IdentifyScopeToggleResult) {
    const resolved = model.applyScopedSession(result);
    syncFromModel();
    if (resolved.kind === 'activate') {
      syncResultPanel(resolved.panel);
      if (resolved.startMapClick) onStartMapClick();
      return;
    }
    if (resolved.kind === 'clear-matching') {
      syncResultPanel(resolved.panel);
    }
    if (!immediatelyRef.current) onRemoveMapClick();
  }

  function onLayerFilterChange(identifyId: string) {
    const id = resolveIdentifyLayerFilterId(identifyId);
    model.setFilterIdentifyId(id);
    syncFromModel();
    syncResultPanel({
      selectedLayerId: id ?? IDENTIFY_ALL_LAYERS_VALUE,
    });
    const current = originRef.current;
    if (current.latitude !== 0 || current.longitude !== 0) {
      callMap((map) => {
        const point = map.project([current.longitude, current.latitude]);
        void onGetFeatures(point);
      });
    }
  }

  const toolbarConfig = useMemo(
    () => ({
      kind: 'single' as const,
      id: IDENTIFY_CONTROL.id,
      getState: () =>
        mdiButtonState(mdiHandPointingUp, {
          visible: viewsRef.current.length > 0,
          active: showRef.current,
          loading: loadingRef.current,
          title: trans('map.identify.title'),
          order,
        }),
      onClick: () => handleToggle(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trans, order],
  );

  const { state, control } = useToolbarControl(mapId, merged, toolbarConfig);

  useEffect(() => {
    control.sync();
  }, [show, loading, views.length, control]);

  function setIdentifyLoading(value: boolean) {
    model.setLoading(value);
    syncFromModel();
    syncResultPanel({ loading: value });
    control.sync();
  }

  useRegisterMapControl(mapId, {
    id: IDENTIFY_CONTROL.id,
    panelKind: 'button',
    title: trans('map.identify.title'),
    buttonPosition: merged.position,
    show,
    setShow: (value) => {
      model.setShow(value);
      syncFromModel();
      syncResultPanel({ show: value });
    },
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
      immediately: props.immediately,
      preferResultControl: props.preferResultControl,
    }),
    actions: [
      { type: IDENTIFY_CONTROL.id, run: () => handleToggle() },
      {
        type: IDENTIFY_CONTROL.actionSetScoped,
        run: (event) =>
          applyScopedSession(event as IdentifyScopeToggleResult | undefined),
      },
      {
        type: IDENTIFY_CONTROL.actionUseMapClick,
        run: () => onUseMapClick(),
      },
      {
        type: IDENTIFY_CONTROL.actionUseBoxSelect,
        run: () => onUseBoxSelect(),
      },
      {
        type: IDENTIFY_CONTROL.actionSetLayerFilter,
        run: (event) => {
          const payload = event as IdentifyLayerFilterPayload | undefined;
          onLayerFilterChange(payload?.identifyId ?? '');
        },
      },
      {
        type: IDENTIFY_CONTROL.actionClose,
        run: () => close(),
      },
      {
        type: IDENTIFY_CONTROL.actionSetLoading,
        run: (event) => {
          setIdentifyLoading(!!event);
        },
      },
    ],
  });

  return (
    <>
      <ModuleContainer
        {...moduleContainerProps}
        btn={
          state ? (
            <MapCommonButton
              option={state}
              onClick={(e) => {
                e.stopPropagation();
                control.onAction(e.nativeEvent);
              }}
            />
          ) : null
        }
      />
      <IdentifyResultControl
        position={merged.position}
        controlLayout={merged.controlLayout}
      />
    </>
  );
}
