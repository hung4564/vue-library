import type { WithMapPropType } from '@hungpvq/map-core';
import { EventClick } from '@hungpvq/map-core/event';
import {
  DrawingTypeName,
  MapDraw,
  StaticMode,
  getDrawStyles,
  type DrawCreateEvent,
  type DrawDeleteEvent,
  type DrawUpdateEvent,
  type MapDrawOption,
  type MapDrawOptions,
} from '@hungpvq/map-draw';
import {
  ContextMenu,
  type ContextMenuRef,
} from '@hungpvq/react-draggable';
import {
  MapControlButton,
  MapControlGroupButton,
  ModuleContainer,
  defaultMapProps,
  useEventMap,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
  useToolbarControl,
} from '@hungpvq/react-map-core';
import {
  mdiClose,
  mdiContentSave,
  mdiContentSaveCheck,
  mdiDeleteOutline,
  mdiPencil,
  mdiPlus,
  mdiUndoVariant,
  mdiViewListOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import type { Feature, FeatureCollection } from 'geojson';
import type { MapMouseEvent } from 'maplibre-gl';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { DRAW_CONTROL_LOCALE } from '../../locale';
import { isDraftOption, useConfigDrawControl } from '../../store';
import '../../style.css';

export interface DrawControlProps extends WithMapPropType {
  drawOptions?: MapDrawOption;
  drawControlOptions?: MapDrawOptions;
}

function ensureFeatureId(feature: Feature): Feature {
  if (feature.id == null && feature.properties?.['id'] != null) {
    feature.id = feature.properties['id'] as string | number;
  }
  return feature;
}

export function DrawControl(props: DrawControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps, callMap, order } = useMap(merged);
  const { setLocaleDefault } = useLang(mapId);

  useEffect(() => {
    setLocaleDefault(DRAW_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  const [isShow, setIsShow] = useState(false);
  const [isDraw, setIsDraw] = useState(false);
  const [method, setMethod] = useState('');
  const [drawOptions, setDrawOptions] = useState<MapDrawOption | undefined>(
    props.drawOptions,
  );
  const [drawSupport, setDrawSupport] = useState<string[]>([]);
  const [draftCounts, setDraftCounts] = useState(0);
  const [showList, setShowList] = useShow(false);
  const [draftItems, setDraftItems] = useState<
    { id: string | number; status: string }[]
  >([]);
  const [currentFeature, setCurrentFeature] = useState<Feature | undefined>();

  const contextMenuRef = useRef<ContextMenuRef>(null);
  const handlersRef = useRef<{
    onDrawCreated: (e: DrawCreateEvent) => void;
    onDrawUpdated: (e: DrawUpdateEvent) => void;
    onDrawDeleted: (e: DrawDeleteEvent) => void;
  }>({
    onDrawCreated: () => undefined,
    onDrawUpdated: () => undefined,
    onDrawDeleted: () => undefined,
  });

  const methodRef = useRef(method);
  methodRef.current = method;
  const drawOptionsRef = useRef(drawOptions);
  drawOptionsRef.current = drawOptions;

  const controlRef = useRef(
    new MapDraw({
      displayControlsDefault: false,
      boxSelect: false,
      styles: getDrawStyles(
        props.drawOptions?.primaryColor,
        props.drawOptions?.activeColor,
      ),
      ...props.drawControlOptions,
      modes: {
        ...MapDraw.modes,
        static: StaticMode,
        ...props.drawControlOptions?.modes,
      },
    }),
  );

  const onMapClick = useCallback(
    async (e: MapMouseEvent) => {
      const action = drawOptionsRef.current;
      if (!action?.selectFeature) return;
      const feature = await action.selectFeature(
        { point: [e.lngLat.lng, e.lngLat.lat] },
        { mapId },
      );
      if (!feature) {
        setCurrentFeature(undefined);
        return;
      }
      ensureFeatureId(feature);
      setCurrentFeature(feature);
      const m = methodRef.current;
      if (m === 'select') {
        setFeatureRef.current('updated', feature);
        const ids = controlRef.current.add({
          type: 'FeatureCollection',
          features: [feature],
        });
        if (ids.length) {
          setIsDraw(true);
          removeEventClickRef.current();
          // mapbox-gl-draw: direct_select does not support Point
          if (feature.geometry?.type === 'Point') {
            controlRef.current.changeMode('simple_select', {
              featureIds: ids,
            });
          } else {
            controlRef.current.changeMode('direct_select', {
              featureId: ids[0],
            });
          }
        }
      } else if (m === 'delete') {
        if (feature.id != null) {
          controlRef.current.delete(String(feature.id));
        }
        await action.deleteFeature?.(feature, { mapId });
        if (!isDraftOption(action)) await action.redraw?.(mapId);
      }
    },
    [mapId],
  );

  const clickEvent = useMemo(
    () => new EventClick().setHandler(onMapClick),
    [onMapClick],
  );
  const { add: addEventClick, remove: removeEventClick } = useEventMap(
    mapId,
    clickEvent,
  );
  const removeEventClickRef = useRef(removeEventClick);
  removeEventClickRef.current = removeEventClick;

  const refreshDrafts = useCallback(() => {
    if (!isDraftOption(drawOptions)) return;
    const items = drawOptions.getDraftItems();
    setDraftItems(items.map((i) => ({ id: i.id, status: i.status })));
    setDraftCounts(items.length);
  }, [drawOptions]);

  const close = useCallback(() => {
    removeEventClick();
    setIsDraw(false);
    setIsShow(false);
    callMap((map) => {
      const control = controlRef.current;
      const h = handlersRef.current;
      map.off('draw.create', h.onDrawCreated);
      map.off('draw.update', h.onDrawUpdated);
      map.off('draw.delete', h.onDrawDeleted);
      if (map.hasControl(control as never)) map.removeControl(control as never);
    });
  }, [callMap, removeEventClick]);

  const onSelectMethod = useCallback(
    (value: 'select' | 'delete') => {
      removeEventClick();
      setMethod(value);
      addEventClick();
      controlRef.current.changeMode('static');
    },
    [addEventClick, removeEventClick],
  );

  const onStart = useCallback(
    (config: MapDrawOption) => {
      setIsShow(true);
      const next = props.drawOptions || config;
      setDrawOptions(next);
      setDrawSupport(next.drawSupports || []);
      callMap((map) => {
        const control = controlRef.current;
        const h = handlersRef.current;
        map.on('draw.create', h.onDrawCreated);
        map.on('draw.update', h.onDrawUpdated);
        map.on('draw.delete', h.onDrawDeleted);
        if (!map.hasControl(control as never)) map.addControl(control as never);
        control.changeMode('static');
      });
      onSelectMethod('select');
    },
    [callMap, onSelectMethod, props.drawOptions],
  );

  const { setFeature, save, commit, discard } = useConfigDrawControl(mapId, {
    onStart,
    onEnd: close,
    onDiscard: refreshDrafts,
    onCommit: () => {
      setDraftCounts(0);
      setDraftItems([]);
    },
  });
  const setFeatureRef = useRef(setFeature);
  setFeatureRef.current = setFeature;

  handlersRef.current = {
    onDrawCreated(event) {
      for (const feature of event.features) {
        if (methodRef.current === 'select') {
          setFeature('updated', ensureFeatureId(feature));
        } else {
          setFeature('added', feature);
        }
      }
    },
    onDrawUpdated(event) {
      for (const feature of event.features) setFeature('updated', feature);
    },
    onDrawDeleted(event) {
      for (const feature of event.features) setFeature('deleted', feature);
      onSelectMethod('select');
    },
  };

  const onDraw = (type: string) => {
    removeEventClick();
    setCurrentFeature(undefined);
    setMethod('create');
    controlRef.current.changeMode(type);
    setIsDraw(true);
  };

  const supportItems = useMemo(
    () =>
      drawSupport.map((x) => ({
        id: x,
        name: DrawingTypeName[x as keyof typeof DrawingTypeName] || x,
      })),
    [drawSupport],
  );

  const onStartDraw = (e: ReactMouseEvent) => {
    removeEventClick();
    if (drawSupport.length > 1) {
      contextMenuRef.current?.open(e);
      return;
    }
    if (drawSupport[0]) onDraw(drawSupport[0]);
    else if (supportItems[0]) onDraw(supportItems[0].id);
  };

  const onSave = async () => {
    setIsDraw(false);
    onSelectMethod('select');
    setCurrentFeature(undefined);
    await save(controlRef.current.getAll() as FeatureCollection, { mapId });
    if (drawOptions?.cleanAfterDone) controlRef.current.deleteAll();
    refreshDrafts();
    if (!isDraftOption(drawOptions)) {
      await drawOptions?.redraw?.(mapId);
    }
  };

  const onCancel = () => {
    setIsDraw(false);
    void drawOptions?.cancel?.(currentFeature);
    if (drawOptions?.cleanAfterDone) controlRef.current.deleteAll();
    onSelectMethod('select');
    setCurrentFeature(undefined);
  };

  useRegisterMapControl(mapId, {
    id: 'mapDrawDraftList',
    panelKind: 'popup',
    title: 'Draft items',
    show: showList,
    setShow: (v) => setShowList(v),
    getProps: () => ({ draftCounts }),
    actions: [{ type: 'mapDrawDraftList', run: () => setShowList(true) }],
  });

  const { control: toolbarControl } = useToolbarControl(mapId, merged, {
    kind: 'module',
    moduleId: 'mapDrawControl',
    order: order,
    orientation: 'row',
    buttons: [
      {
        id: 'cancel',
        getState: () => ({
          visible: isShow && isDraw,
          title: 'Cancel',
          icon: { type: 'mdi' as const, path: mdiClose },
        }),
        onClick: () => onCancel(),
      },
      {
        id: 'save',
        getState: () => ({
          visible: isShow && isDraw,
          title: 'Save',
          icon: { type: 'mdi' as const, path: mdiContentSave },
        }),
        onClick: () => {
          void onSave();
        },
      },
      {
        id: 'close',
        getState: () => ({
          visible: isShow && !isDraw,
          title: 'Close',
          icon: { type: 'mdi' as const, path: mdiClose },
        }),
        onClick: () => close(),
      },
      {
        id: 'add',
        getState: () => ({
          visible: isShow && !isDraw,
          active: method === 'create',
          title: 'Draw',
          icon: { type: 'mdi' as const, path: mdiPlus },
        }),
        onClick: (e) => onStartDraw(e as unknown as ReactMouseEvent),
      },
      {
        id: 'select',
        getState: () => ({
          visible: isShow && !isDraw,
          active: method === 'select',
          title: 'Select',
          icon: { type: 'mdi' as const, path: mdiPencil },
        }),
        onClick: () => onSelectMethod('select'),
      },
      {
        id: 'delete',
        getState: () => ({
          visible: isShow && !isDraw,
          active: method === 'delete',
          title: 'Delete',
          icon: { type: 'mdi' as const, path: mdiDeleteOutline },
        }),
        onClick: () => onSelectMethod('delete'),
      },
      {
        id: 'commit',
        getState: () => ({
          visible: !!(isDraftOption(drawOptions) && drawOptions?.draft?.show),
          disabled: isDraw || draftCounts === 0,
          title: 'Commit drafts',
          icon: { type: 'mdi' as const, path: mdiContentSaveCheck },
        }),
        onClick: () => {
          void commit().then(() => drawOptions?.redraw?.(mapId));
        },
      },
      {
        id: 'discard',
        getState: () => ({
          visible: !!(isDraftOption(drawOptions) && drawOptions?.draft?.show),
          disabled: isDraw || draftCounts === 0,
          title: 'Discard drafts',
          icon: { type: 'mdi' as const, path: mdiUndoVariant },
        }),
        onClick: () => {
          void discard();
        },
      },
      {
        id: 'list',
        getState: () => ({
          visible: !!(isDraftOption(drawOptions) && drawOptions?.draft?.show),
          disabled: draftCounts === 0,
          title: 'Draft list',
          icon: { type: 'mdi' as const, path: mdiViewListOutline },
        }),
        onClick: () => setShowList(true),
      },
    ],
  });

  useEffect(() => {
    toolbarControl.sync();
  }, [
    isShow,
    isDraw,
    method,
    draftCounts,
    drawOptions,
    toolbarControl,
  ]);

  const toolbar = drawOptions ? (
    <div className="d-flex button-custom-container button-draw-container">
      {isShow ? (
        isDraw ? (
          <MapControlGroupButton row>
            <MapControlButton onClick={onCancel} title="Cancel">
              <Icon path={mdiClose} size={0.75} />
            </MapControlButton>
            <MapControlButton onClick={() => void onSave()} title="Save">
              <Icon path={mdiContentSave} size={0.75} />
            </MapControlButton>
          </MapControlGroupButton>
        ) : (
          <MapControlGroupButton row>
            <MapControlButton onClick={close} title="Close">
              <Icon path={mdiClose} size={0.75} />
            </MapControlButton>
            <MapControlButton
              active={method === 'create'}
              title="Draw"
              onClick={onStartDraw}
            >
              <Icon path={mdiPlus} size={0.75} />
            </MapControlButton>
            <MapControlButton
              active={method === 'select'}
              title="Select"
              onClick={() => onSelectMethod('select')}
            >
              <Icon path={mdiPencil} size={0.75} />
            </MapControlButton>
            <MapControlButton
              active={method === 'delete'}
              title="Delete"
              onClick={() => onSelectMethod('delete')}
            >
              <Icon path={mdiDeleteOutline} size={0.75} />
            </MapControlButton>
          </MapControlGroupButton>
        )
      ) : null}
      {isDraftOption(drawOptions) && drawOptions.draft.show ? (
        <MapControlGroupButton row>
          <MapControlButton
            disabled={isDraw || draftCounts === 0}
            title="Commit drafts"
            onClick={() =>
              void commit().then(() => drawOptions.redraw?.(mapId))
            }
          >
            <Icon path={mdiContentSaveCheck} size={0.75} />
          </MapControlButton>
          <MapControlButton
            disabled={isDraw || draftCounts === 0}
            title="Discard drafts"
            onClick={() => void discard()}
          >
            <Icon path={mdiUndoVariant} size={0.75} />
          </MapControlButton>
          <MapControlButton
            disabled={draftCounts === 0}
            title="Draft list"
            onClick={() => setShowList(true)}
          >
            <Icon path={mdiViewListOutline} size={0.75} />
            {draftCounts > 0 ? (
              <span className="draft-item-count-badge map-control-badge">
                {draftCounts}
              </span>
            ) : null}
          </MapControlButton>
        </MapControlGroupButton>
      ) : null}
    </div>
  ) : null;

  return (
    <>
      <ModuleContainer
        {...moduleContainerProps}
        btn={toolbar}
        draggable={
          showList
            ? () => (
                <div className="map-draw-draft-list">
                  <strong>Draft items ({draftCounts})</strong>
                  <ul>
                    {draftItems.map((item) => (
                      <li key={String(item.id)}>
                        {String(item.id)} — {item.status}{' '}
                        <button
                          type="button"
                          onClick={() => void discard(item as never)}
                        >
                          Discard
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => setShowList(false)}>
                    Close
                  </button>
                </div>
              )
            : undefined
        }
      />
      <ContextMenu ref={contextMenuRef}>
        <ul className="context-menu">
          {supportItems.map((option) => (
            <li
              key={option.id}
              className="context-menu__item"
              onClick={(e) => {
                e.stopPropagation();
                onDraw(option.id);
                contextMenuRef.current?.close();
              }}
            >
              <span>{option.name}</span>
            </li>
          ))}
        </ul>
      </ContextMenu>
    </>
  );
}
