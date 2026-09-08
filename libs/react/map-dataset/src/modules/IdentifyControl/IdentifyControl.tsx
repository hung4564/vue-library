import type {
  EventBboxRangerHandle,
  MapMenuItemProps,
  WithMapPropType,
} from '@hungpvq/map-core';
import {
  EventBboxRanger,
  EventClick,
  logHelper,
  MAP_CONTEXT_MENU_ID,
} from '@hungpvq/map-core';
import type { IdentifyMultiResult, IIdentifyView } from '@hungpvq/map-dataset';
import {
  clearIdentifyScope,
  handleMultiIdentify,
  IDENTIFY_ALL_LAYERS_VALUE,
  IDENTIFY_CONTROL,
  IDENTIFY_CONTROL_LOCALE,
  IDENTIFY_RESULT_CONTROL,
  identifyResolver,
  type IdentifyLayerFilterPayload,
  type IdentifyResultUpdatePayload,
  type IdentifyScopeToggleResult,
} from '@hungpvq/map-dataset';
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
import { loggerIdentify } from '../../logger';
import { useMapDataset, useMapDatasetHighlight } from '../../store';
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
  const { setFeatureHighlight } = useMapDatasetHighlight(mapId);
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(!!props.show);
  const [views, setViews] = useState<IIdentifyView[]>([]);
  /** Local layer filter for IdentifyControl only (not synced with layer-item). */
  const [filterIdentifyId, setFilterIdentifyId] = useState<
    string | undefined
  >();
  const [isUseClick, setIsUseClick] = useState(false);
  const [isSelectBbox, setIsSelectBbox] = useState(false);
  const [origin, setOrigin] = useState({ latitude: 0, longitude: 0 });
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    setLocaleDefault(IDENTIFY_CONTROL_LOCALE);
  }, [setLocaleDefault]);

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

  const syncResultPanel = useCallback(
    (extra?: IdentifyResultUpdatePayload) => {
      updateResultPanel(mapId, {
        loading: loadingRef.current,
        origin: originRef.current,
        layerItems: [
          {
            value: IDENTIFY_ALL_LAYERS_VALUE,
            text: transRef.current('map.identify.all_layers'),
          },
          ...viewsRef.current.map((view) => ({
            value: view.id,
            text: view.getName?.() || view.id,
          })),
        ],
        selectedLayerId:
          filterIdentifyIdRef.current ?? IDENTIFY_ALL_LAYERS_VALUE,
        isEventClickActive: isEventClickActiveRef.current,
        isEventClickBox: isEventClickBoxRef.current,
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

  const onSelectFeatures = useCallback(
    (event?: MapMouseEvent, features: IdentifyMultiResult[] = []) => {
      logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl').debug(
        'onSelectFeatures',
        features,
      );
      identifyResolver
        .execute({
          records: features,
          mapId: mapId,
          event,
          singleLayer: !!filterIdentifyIdRef.current,
          preferResultControl: preferResultControlRef.current,
        })
        .then((res) =>
          logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl').debug(
            'onSelectFeaturesResult',
            res,
          ),
        );
    },
    [mapId],
  );

  const onGetFeatures = useCallback(
    async (
      pointOrBox: PointLike | [PointLike, PointLike],
      event?: MapMouseEvent,
    ) => {
      const loadStartedAt = performance.now();
      setLoading(true);
      loadingRef.current = true;
      // Activate identify session (toolbar) without forcing ResultControl open.
      toggleShow(true);
      showRef.current = true;
      syncResultPanel({ loading: true });
      callMapRef.current((map) => {
        map.getCanvas().style.cursor = 'wait';
      });
      logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl').info(
        'loading:start',
        { pointOrBox },
      );
      let featureCount = 0;
      let hitCount = 0;
      try {
        const allIdentifies = (
          getAllComponentsByType<IIdentifyView>('identify') || []
        ).reverse();
        viewsRef.current = allIdentifies;
        setViews(allIdentifies);
        const filterId = filterIdentifyIdRef.current;
        const identifies = filterId
          ? allIdentifies.filter((view) => view.id === filterId)
          : allIdentifies;
        logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl').debug(
          'onGetFeatures',
          { pointOrBox, identifies, filterId },
        );
        const features = await handleMultiIdentify(
          identifies,
          mapId,
          pointOrBox,
        );
        logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl').debug(
          'onGetFeatures',
          { features },
        );
        const nonEmpty = features.filter(
          (item): item is IdentifyMultiResult =>
            'features' in item && item.features.length > 0,
        );
        hitCount = nonEmpty.length;
        featureCount = nonEmpty.reduce(
          (sum, item) => sum + (item.features?.length ?? 0),
          0,
        );
        // Always run resolver so empty clears prior result-panel items.
        onSelectFeatures(event, nonEmpty);
      } finally {
        setLoading(false);
        loadingRef.current = false;
        callMapRef.current((map) => {
          map.getCanvas().style.cursor = '';
        });
        syncResultPanel({ loading: false });
        logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl').info(
          'loading:done',
          {
            durationMs: Math.round(performance.now() - loadStartedAt),
            hitCount,
            featureCount,
            empty: featureCount === 0,
          },
        );
      }
    },
    [
      mapId,
      onSelectFeatures,
      getAllComponentsByType,
      toggleShow,
      syncResultPanel,
    ],
  );

  const onGetFeaturesRef = useRef(onGetFeatures);
  onGetFeaturesRef.current = onGetFeatures;
  const toggleShowRef = useRef(toggleShow);
  toggleShowRef.current = toggleShow;
  const callMapRef = useRef(callMap);
  callMapRef.current = callMap;

  useEffect(() => {
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      MAP_CONTEXT_MENU_ID.identifyHere,
      (menuProps: MapMenuItemProps) => {
        const { lng, lat } = menuProps.layer.lngLat;
        const run = (point: PointLike) => {
          const nextOrigin = { latitude: lat, longitude: lng };
          setOrigin(nextOrigin);
          originRef.current = nextOrigin;
          toggleShowRef.current(true);
          showRef.current = true;
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
  }, [mapId]);

  const onStartMapClick = useCallback(() => {
    setIsUseClick(true);
    addEventClickRef.current();
    syncResultPanel({ isEventClickActive: true });
  }, [syncResultPanel]);

  const onRemoveMapClick = useCallback(() => {
    setIsUseClick(false);
    removeEventClickRef.current();
    syncResultPanel({ isEventClickActive: false });
  }, [syncResultPanel]);

  const onStartBox = useCallback(() => {
    setIsSelectBbox(true);
    addEventBboxRef.current();
    syncResultPanel({ isEventClickBox: true });
  }, [syncResultPanel]);

  const onRemoveBox = useCallback(() => {
    setIsSelectBbox(false);
    window.setTimeout(() => {
      removeEventBboxRef.current();
      syncResultPanel({ isEventClickBox: false });
    }, 500);
  }, [syncResultPanel]);

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
    setFilterIdentifyId(undefined);
    filterIdentifyIdRef.current = undefined;
    clearIdentifyScope(mapId);
    onRemoveIdentify();
    setFeatureHighlight(undefined, 'identify');
    setLoading(false);
    loadingRef.current = false;
    const clearedOrigin = { latitude: 0, longitude: 0 };
    setOrigin(clearedOrigin);
    originRef.current = clearedOrigin;
    toggleShow(false);
    showRef.current = false;
    syncResultPanel({
      show: false,
      loading: false,
      origin: clearedOrigin,
      selectedLayerId: IDENTIFY_ALL_LAYERS_VALUE,
      items: [],
    });
  }, [mapId, onRemoveIdentify, setFeatureHighlight, toggleShow, syncResultPanel]);

  onMapClickRef.current = (e: MapMouseEvent) => {
    if (isEventClickBoxRef.current) return;
    logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl').debug(
      'onMapClick',
      { event: e },
    );
    const nextOrigin = { latitude: e.lngLat.lat, longitude: e.lngLat.lng };
    setOrigin(nextOrigin);
    originRef.current = nextOrigin;
    toggleShowRef.current(true);
    showRef.current = true;
    onGetFeatures(e.point, e);
  };

  onBboxSelectRef.current = (bbox) => {
    if (isEventClickActiveRef.current) return;
    logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl').debug(
      'onBboxSelect',
      bbox,
    );
    onRemoveBox();
    if (!bbox) return;
    toggleShowRef.current(true);
    showRef.current = true;
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
    const next = !showRef.current;
    toggleShow();
    showRef.current = next;
    syncResultPanel({ show: next });
    if (next) {
      if (!isUseClickRef.current) onStartMapClick();
    } else {
      onRemoveIdentify();
    }
  }

  /** One-way from layer-item: start identify + filter; do not open result popup. */
  function applyScopedSession(result?: IdentifyScopeToggleResult) {
    const clearedOrigin = { latitude: 0, longitude: 0 };
    if (result?.active && result.identifyId) {
      setFilterIdentifyId(result.identifyId);
      filterIdentifyIdRef.current = result.identifyId;
      setOrigin(clearedOrigin);
      originRef.current = clearedOrigin;
      toggleShow(true);
      showRef.current = true;
      syncResultPanel({
        selectedLayerId: result.identifyId,
        items: [],
        loading: false,
        origin: clearedOrigin,
      });
      if (!isUseClickRef.current) onStartMapClick();
      return;
    }
    if (
      result?.identifyId &&
      filterIdentifyIdRef.current &&
      filterIdentifyIdRef.current === result.identifyId
    ) {
      setFilterIdentifyId(undefined);
      filterIdentifyIdRef.current = undefined;
      setOrigin(clearedOrigin);
      originRef.current = clearedOrigin;
      syncResultPanel({
        selectedLayerId: IDENTIFY_ALL_LAYERS_VALUE,
        items: [],
        loading: false,
        origin: clearedOrigin,
      });
    }
    if (!immediatelyRef.current) onRemoveMapClick();
  }

  function onLayerFilterChange(identifyId: string) {
    const id =
      !identifyId || identifyId === IDENTIFY_ALL_LAYERS_VALUE
        ? undefined
        : identifyId;
    const clearedOrigin = { latitude: 0, longitude: 0 };
    setFilterIdentifyId(id);
    filterIdentifyIdRef.current = id;
    setOrigin(clearedOrigin);
    originRef.current = clearedOrigin;
    syncResultPanel({
      selectedLayerId: id ?? IDENTIFY_ALL_LAYERS_VALUE,
      items: [],
      loading: false,
      origin: clearedOrigin,
    });
  }

  const toolbarConfig = useMemo(
    () => ({
      kind: 'single' as const,
      id: IDENTIFY_CONTROL.id,
      getState: () => ({
        visible: viewsRef.current.length > 0,
        active: showRef.current,
        loading: loadingRef.current,
        title: trans('map.identify.title'),
        order,
        icon: { type: 'mdi' as const, path: mdiHandPointingUp },
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
    setLoading(value);
    loadingRef.current = value;
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
      toggleShow(value);
      showRef.current = value;
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
