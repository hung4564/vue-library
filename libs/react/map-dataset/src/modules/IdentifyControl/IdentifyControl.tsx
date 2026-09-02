import type { EventBboxRangerHandle, MapMenuItemProps, WithMapPropType } from '@hungpvq/map-core';
import {
  EventBboxRanger,
  EventClick,
  logHelper,
  MAP_CONTEXT_MENU_ID,
} from '@hungpvq/map-core';
import type {
  IDataset,
  IdentifyMultiResult,
  IdentifyResult,
  IIdentifyView,
  MenuAction,
} from '@hungpvq/map-dataset';
import {
  IDENTIFY_CONTROL_LOCALE,
  convertFeatureToItem,
  handleMenuAction,
  handleMultiIdentify,
  handleMultiIdentifyGetFirst,
} from '@hungpvq/map-dataset';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  BaseButton,
  MapCommonButton,
  ModuleContainer,
  defaultMapProps,
  useCoordinate,
  useEventMap,
  useLang,
  useMap,
  useShow,
  useToolbarControl,
  UniversalRegistry,
} from '@hungpvq/react-map-core';
import { mdiCursorPointer, mdiHandPointingUp, mdiSelect } from '@mdi/js';
import Icon from '@mdi/react';
import type { MapMouseEvent, PointLike } from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loggerIdentify } from '../../logger';
import { useMapDataset, useMapDatasetHighlight } from '../../store';
import { IdentifyMenuItem } from './IdentifyMenuItem';

const ICON_SIZE = 16 / 24;

interface Grouped {
  id: string;
  name: string;
  items: ({ id: string | number; name?: string; data: unknown } & {
    identify: IIdentifyView;
  })[];
}

function groupItems(items: IdentifyMultiResult[]): Grouped[] {
  const groups: Grouped[] = [];
  const groupExistingIds = new Map<string, Set<string | number>>();

  for (const item of items) {
    let group: Grouped | undefined;
    const groupIdentify = item.identify.group;
    if (groupIdentify) {
      group = groups.find((g) => g.id === groupIdentify.id);
      if (!group) {
        group = { id: groupIdentify.id, name: groupIdentify.name, items: [] };
        groups.push(group);
      }
    } else {
      group = {
        id: item.identify.id,
        name: item.identify.getName(),
        items: [],
      };
      groups.push(group);
    }
    let existingIds = groupExistingIds.get(group.id);
    if (!existingIds) {
      existingIds = new Set<string | number>();
      groupExistingIds.set(group.id, existingIds);
    }

    for (const f of item.features) {
      const fid = f.id;
      if (!existingIds.has(fid)) {
        group.items.push({ ...f, identify: item.identify });
        existingIds.add(fid);
      }
    }
  }
  return groups;
}

export function IdentifyControl(
  props: WithMapPropType & { show?: boolean; immediately?: boolean },
) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps, order, callMap } = useMap(merged);
  const { getAllComponentsByType, datasetVersion } = useMapDataset(mapId);
  const { setFeatureHighlight } = useMapDatasetHighlight(mapId);
  const { trans, setLocaleDefault } = useLang(mapId);
  const { format: formatCoordinate } = useCoordinate(mapId);
  const [show, toggleShow] = useShow(!!props.show);
  const [views, setViews] = useState<IIdentifyView[]>([]);
  const [isUseClick, setIsUseClick] = useState(false);
  const [isSelectBbox, setIsSelectBbox] = useState(false);
  const [origin, setOrigin] = useState({ latitude: 0, longitude: 0 });
  const [resultItems, setResultItems] = useState<Grouped[]>([]);
  const [loading, setLoading] = useState(false);

  const viewsRef = useRef(views);
  viewsRef.current = views;
  const showRef = useRef(show);
  showRef.current = show;
  const immediatelyRef = useRef(!!props.immediately);
  immediatelyRef.current = !!props.immediately;
  const isUseClickRef = useRef(isUseClick);
  isUseClickRef.current = isUseClick;
  const isSelectBboxRef = useRef(isSelectBbox);
  isSelectBboxRef.current = isSelectBbox;

  useEffect(() => {
    setLocaleDefault(IDENTIFY_CONTROL_LOCALE);
  }, [setLocaleDefault]);

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

  const onSelectFeatures = useCallback(
    (event?: MapMouseEvent, features: IdentifyMultiResult[] = []) => {
      logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl').debug(
        'onSelectFeatures',
        features,
      );
      setResultItems(groupItems(features));
      if (
        immediatelyRef.current &&
        features[0]?.features?.[0]
      ) {
        const menu = features[0].identify.getMenu('show-detail');
        if (menu) {
          handleMenuAction(menu, {
            event,
            layer: features[0].identify,
            mapId,
            value: features[0].features[0].data,
          });
        }
      }
    },
    [mapId],
  );

  const onGetFeatures = useCallback(
    async (
      pointOrBox: PointLike | [PointLike, PointLike],
      event?: MapMouseEvent,
    ) => {
      setLoading(true);
      try {
        // Always read latest identify views (datasets may load after first mount)
        const identifies = (
          getAllComponentsByType<IIdentifyView>('identify') || []
        ).reverse();
        viewsRef.current = identifies;
        setViews(identifies);
        logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl').debug(
          'onGetFeatures',
          { pointOrBox, identifies },
        );
        const startTime = Date.now();
        const features = await handleMultiIdentify(
          identifies,
          mapId,
          pointOrBox,
        );
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 500) {
          await new Promise((resolve) =>
            setTimeout(resolve, 500 - elapsedTime),
          );
        }
        logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl').debug(
          'onGetFeatures',
          { features },
        );
        onSelectFeatures(
          event,
          features.filter(
            (item): item is IdentifyMultiResult =>
              'features' in item && item.features.length > 0,
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [mapId, onSelectFeatures, getAllComponentsByType],
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
      (props: MapMenuItemProps) => {
        const { lng, lat } = props.layer.lngLat;
        const run = (point: PointLike) => {
          setOrigin({ latitude: lat, longitude: lng });
          toggleShowRef.current(true);
          void onGetFeaturesRef.current(point);
        };
        if (props.layer.point) {
          run(props.layer.point);
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
  }, []);

  const onRemoveMapClick = useCallback(() => {
    setIsUseClick(false);
    removeEventClickRef.current();
  }, []);

  const onStartBox = useCallback(() => {
    setIsSelectBbox(true);
    addEventBboxRef.current();
  }, []);

  const onRemoveBox = useCallback(() => {
    setIsSelectBbox(false);
    window.setTimeout(() => {
      removeEventBboxRef.current();
    }, 500);
  }, []);

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
    onRemoveIdentify();
    setFeatureHighlight(undefined, 'identify');
    onSelectFeatures(undefined, []);
  }, [onRemoveIdentify, setFeatureHighlight, onSelectFeatures]);

  onMapClickRef.current = (e: MapMouseEvent) => {
    if (isEventClickBox) return;
    logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl').debug(
      'onMapClick',
      { event: e },
    );
    setOrigin({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
    onGetFeatures(e.point, e);
  };

  onBboxSelectRef.current = (bbox) => {
    if (isEventClickActive) return;
    logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl').debug(
      'onBboxSelect',
      bbox,
    );
    onRemoveBox();
    if (!bbox) return;
    onGetFeatures([
      [bbox[0].x, bbox[0].y],
      [bbox[1].x, bbox[1].y],
    ]);
  };

  useEffect(() => {
    if (props.immediately) onUseMapClick();
    // start click-to-identify once when immediately is set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleToggle() {
    toggleShow();
    onUseMapClick();
  }

  function onMenuAction(
    identify: IIdentifyView,
    menu: MenuAction,
    item: unknown,
    event?: MapMouseEvent | React.MouseEvent,
  ) {
    const nativeEvent =
      event && 'nativeEvent' in event ? event.nativeEvent : event;
    handleMenuAction(menu, {
      event: nativeEvent,
      layer: identify,
      mapId,
      value: item,
    });
  }

  function onFeatureClick(
    identify: IIdentifyView,
    item: unknown,
    event?: React.MouseEvent,
  ) {
    const menu = identify.getMenu?.('show-detail');
    if (menu) {
      onMenuAction(identify, menu, item, event);
      return;
    }
    if (identify.showDetail) {
      identify.showDetail(mapId, item as never);
    }
  }

  const currentPoint = useMemo(() => {
    const point = formatCoordinate(origin);
    return `${point.longitude}, &nbsp;${point.latitude}`;
  }, [origin, formatCoordinate]);

  const hasSelectedPoint = origin.latitude !== 0 || origin.longitude !== 0;

  const toolbarConfig = useMemo(
    () => ({
      kind: 'single' as const,
      id: 'mapIdentifyControl',
      getState: () => ({
        visible: viewsRef.current.length > 0,
        active: showRef.current,
        title: trans('map.identify.title'),
        order,
        icon: { type: 'mdi' as const, path: mdiHandPointingUp },
      }),
      onClick: () => handleToggle(),
    }),
    // handleToggle is stable enough via refs; sync toolbar when show/views change separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trans, order],
  );

  const { state, control } = useToolbarControl(mapId, merged, toolbarConfig);

  useEffect(() => {
    control.sync();
  }, [show, views.length, control]);

  return (
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
      draggable={(bind) =>
        show ? (
          <DraggableItemPopup
            show={show}
            onUpdateShow={(v) => {
              // Only sync visibility — do not clear results here.
              // Clearing is handled by onClose when the user dismisses the popup.
              if (!v) toggleShow(false);
              else toggleShow(true);
            }}
            onClose={close}
            title={trans('map.identify.title')}
            width={400}
            height={300}
            extraBtn={
              <>
                <BaseButton
                  active={isEventClickActive}
                  disabled={isEventClickActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUseMapClick();
                  }}
                >
                  <Icon path={mdiCursorPointer} size={ICON_SIZE} />
                </BaseButton>
                <BaseButton
                  active={isEventClickBox}
                  disabled={isEventClickBox}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUseBoxSelect();
                  }}
                >
                  <Icon path={mdiSelect} size={ICON_SIZE} />
                </BaseButton>
              </>
            }
            {...bind}
          >
            <div className="identify-control-container">
              <div className="identify-control-header">
                <b>{trans('map.identify.point')}:</b>
                <span dangerouslySetInnerHTML={{ __html: currentPoint }} />
              </div>
              <hr className="identify-control-separator" />
              <div className="identify-control-body">
                {loading ? (
                  <div className="identify-control-state">
                    <div className="identify-control-state__content">
                      <div className="identify-control-state__loading" />
                      <span>{trans('map.identify.loading')}</span>
                    </div>
                  </div>
                ) : !hasSelectedPoint ? (
                  <div className="identify-control-state">
                    <div className="identify-control-state__content">
                      <span>{trans('map.identify.no_selection')}</span>
                    </div>
                  </div>
                ) : resultItems.length === 0 ? (
                  <div className="identify-control-state">
                    <div className="identify-control-state__content">
                      <span>{trans('map.identify.no_data')}</span>
                    </div>
                  </div>
                ) : (
                  resultItems.map((item) => (
                    <div key={item.id} className="identify-control-list-item">
                      <div className="identify-control-list-item__container">
                        <div
                          className="identify-control-list-item__header"
                          title={item.name}
                        >
                          {item.name || '---'}
                        </div>
                        <div className="identify-control-list-item__child-container">
                          {item.items.map((child) => (
                            <div
                              key={String(child.id)}
                              className="identify-control-child-item"
                              title={child.name || String(child.id)}
                              role="button"
                              tabIndex={0}
                              onClick={(event) =>
                                onFeatureClick(child.identify, child.data, event)
                              }
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  onFeatureClick(child.identify, child.data);
                                }
                              }}
                            >
                              <span className="identify-control-child-item__name">
                                {child.name || String(child.id) || '---'}
                              </span>
                              <div className="identify-control-child-item__spacer" />
                              <div
                                className="identify-control-child-item__action"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {child.identify.getMenus().map((menu, i) => (
                                  <IdentifyMenuItem
                                    key={i}
                                    item={menu}
                                    onClick={(event) =>
                                      onMenuAction(
                                        child.identify,
                                        menu,
                                        child.data,
                                        event,
                                      )
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}

export function IdentifyShowFirstControl(props: WithMapPropType) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId } = useMap(merged);
  const { getAllComponentsByType, datasetVersion } = useMapDataset(mapId);
  const [views, setViews] = useState<Array<IIdentifyView & IDataset>>([]);
  const viewsRef = useRef(views);
  viewsRef.current = views;

  useEffect(() => {
    const next =
      getAllComponentsByType<IIdentifyView & IDataset>('identify') || [];
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

  const onMapClickRef = useRef<(e: MapMouseEvent) => void>(() => undefined);

  const clickEvent = useMemo(
    () =>
      new EventClick().setHandler((e: MapMouseEvent) => {
        onMapClickRef.current(e);
      }),
    [],
  );

  const { add: addEventClick, remove: removeEventClick } = useEventMap(
    mapId,
    clickEvent,
    false,
  );

  onMapClickRef.current = (e: MapMouseEvent) => {
    logHelper(
      loggerIdentify,
      mapId,
      'FIRST',
      'IdentifyShowFirstControl',
    ).debug('onMapClick', { event: e });
    void onGetFeatures(e);
  };

  async function onGetFeatures(e: MapMouseEvent) {
    const pointOrBox = e.point;
    logHelper(
      loggerIdentify,
      mapId,
      'FIRST',
      'IdentifyShowFirstControl',
    ).debug('onGetFeatures', { pointOrBox });
    try {
      const feature = await handleMultiIdentifyGetFirst(
        viewsRef.current,
        mapId,
        pointOrBox,
      );
      logHelper(
        loggerIdentify,
        mapId,
        'FIRST',
        'IdentifyShowFirstControl',
      ).debug('onGetFeatures', { feature });
      onSelectFeatures(feature, e);
    } catch {
      // no feature under cursor
    }
  }

  function onSelectFeatures(
    feature: IdentifyResult | undefined,
    event?: MapMouseEvent,
  ) {
    logHelper(
      loggerIdentify,
      mapId,
      'FIRST',
      'IdentifyShowFirstControl',
    ).debug('onSelectFeatures', { feature });
    if (feature && 'feature' in feature && feature.feature) {
      const menu = feature.identify.getMenu('show-detail');
      if (menu) {
        handleMenuAction(menu, {
          event,
          layer: feature.identify,
          mapId,
          value: convertFeatureToItem(feature.feature.data),
        });
      } else if (feature.identify.showDetail) {
        feature.identify.showDetail(mapId, feature.feature.data);
      }
    }
  }

  useEffect(() => {
    addEventClick();
    return () => removeEventClick();
  }, [addEventClick, removeEventClick]);

  return null;
}
