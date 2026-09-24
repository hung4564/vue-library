import '../../style.css';

import { fitBounds, type WithMapPropType } from '@hungpvq/map-core';
import {
  createMapDrawControl,
  DrawingTypeName,
  isDraftOption,
  type MapDrawOption,
  type MapDrawOptions,
} from '@hungpvq/map-draw';
import { ContextMenu, type ContextMenuRef } from '@hungpvq/react-draggable';
import {
  defaultMapProps,
  ModuleContainer,
  useMap,
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
import type { Feature, FeatureCollection } from 'geojson';
import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useEnsureDrawBuiltinLocales } from '../../extra/lang/ensure-builtin-locales';
import { DrawDraftList } from './components/DrawDraftList';
import { DrawToolbar } from './components/DrawToolbar';
import { useDrawDrafts } from './hooks/useDrawDrafts';
import { useDrawEvents } from './hooks/useDrawEvents';

export interface DrawControlProps extends WithMapPropType {
  drawOptions?: MapDrawOption;
  drawControlOptions?: MapDrawOptions;
}

export function DrawControl(props: DrawControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps, callMap, order } = useMap(merged);
  useEnsureDrawBuiltinLocales(mapId);

  const [isShow, setIsShow] = useState(false);
  const [drawOptions, setDrawOptions] = useState<MapDrawOption | undefined>(
    props.drawOptions,
  );
  const [drawSupport, setDrawSupport] = useState<string[]>([]);

  const contextMenuRef = useRef<ContextMenuRef>(null);
  const drawHandleRef = useRef(
    createMapDrawControl({
      primaryColor: props.drawOptions?.primaryColor,
      activeColor: props.drawOptions?.activeColor,
      drawControlOptions: props.drawControlOptions,
    }),
  );
  const controlRef = useRef(drawHandleRef.current.control);

  const startEndRef = useRef<{
    onStart: (config: MapDrawOption) => void;
    onEnd: () => void;
  }>({
    onStart: () => undefined,
    onEnd: () => undefined,
  });

  const {
    draftItems,
    draftCounts,
    showList,
    setShowList,
    refreshDrafts,
    onCommit,
    onDiscard,
    onShowListDraftItem,
    setFeature,
    save,
  } = useDrawDrafts(mapId, drawOptions, {
    onStart: (config) => startEndRef.current.onStart(config),
    onEnd: () => startEndRef.current.onEnd(),
  });

  const redrawSource = useCallback(async () => {
    if (!drawOptions || isDraftOption(drawOptions)) return;
    await drawOptions.redraw?.(mapId);
  }, [drawOptions, mapId]);

  const {
    isDraw,
    setIsDraw,
    method,
    setCurrentFeature,
    removeEventClick,
    handlersRef,
    onSelectMethod,
    startCreate,
    prepareSave,
    finishCancel,
    redrawNonDraft,
  } = useDrawEvents(mapId, controlRef.current, drawOptions, setFeature, {
    redrawNonDraft: () => redrawSource(),
  });

  const close = useCallback(() => {
    removeEventClick();
    setIsDraw(false);
    setIsShow(false);
    callMap((map) => {
      const h = handlersRef.current;
      map.off('draw.create', h.onDrawCreated);
      map.off('draw.update', h.onDrawUpdated);
      map.off('draw.delete', h.onDrawDeleted);
      drawHandleRef.current.removeFromMap(map);
    });
  }, [callMap, handlersRef, removeEventClick, setIsDraw]);

  useEffect(() => {
    return () => {
      close();
    };
  }, [close]);

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
        drawHandleRef.current.addToMap(map);
        control.changeMode('static');
      });
      onSelectMethod('select');
    },
    [callMap, handlersRef, onSelectMethod, props.drawOptions],
  );

  startEndRef.current = { onStart, onEnd: close };

  const onDraw = (type: string) => {
    setCurrentFeature(undefined);
    startCreate(type);
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
    prepareSave();
    await save(controlRef.current.getAll() as FeatureCollection, { mapId });
    if (drawOptions?.cleanAfterDone) controlRef.current.deleteAll();
    refreshDrafts();
    await redrawNonDraft();
  };

  const onCancel = async () => {
    await finishCancel((feature) => {
      void drawOptions?.cancel?.(feature);
      if (drawOptions?.cleanAfterDone) controlRef.current.deleteAll();
    });
    refreshDrafts();
  };

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
          void onCommit();
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
        onClick: () => onDiscard(),
      },
      {
        id: 'list',
        getState: () => ({
          visible: !!(isDraftOption(drawOptions) && drawOptions?.draft?.show),
          disabled: draftCounts === 0,
          title: 'Draft list',
          icon: { type: 'mdi' as const, path: mdiViewListOutline },
        }),
        onClick: () => onShowListDraftItem(),
      },
    ],
  });

  useEffect(() => {
    toolbarControl.sync();
  }, [isShow, isDraw, method, draftCounts, drawOptions, toolbarControl]);

  const onFlyTo = useCallback(
    (feature: Feature) => {
      callMap((map) => {
        fitBounds(map, feature);
      });
    },
    [callMap],
  );

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <DrawToolbar
          drawOptions={drawOptions}
          isShow={isShow}
          isDraw={isDraw}
          method={method}
          draftCounts={draftCounts}
          onCancel={onCancel}
          onSave={() => void onSave()}
          onClose={close}
          onStartDraw={onStartDraw}
          onSelectMethod={onSelectMethod}
          onCommit={() => void onCommit()}
          onDiscard={() => onDiscard()}
          onShowList={onShowListDraftItem}
        />
      }
      draggable={(bindDrag) => (
        <DrawDraftList
          show={showList}
          setShow={setShowList}
          draftItems={draftItems}
          mapId={mapId}
          onFlyTo={onFlyTo}
          onDiscardItem={(item) => onDiscard(item)}
          bindDrag={bindDrag}
        />
      )}
    >
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
    </ModuleContainer>
  );
}
