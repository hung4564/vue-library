import type { WithMapPropType } from '@hungpvq/map-core';
import type { IIdentifyView } from '@hungpvq/map-dataset/identify';
import type { MenuAction } from '@hungpvq/map-dataset/menu';
import { createMenuConditionContext, getResolvedMenus, handleMenuAction, isMenuItemHidden } from '@hungpvq/map-dataset/menu';
import { IDENTIFY_ALL_LAYERS_VALUE, IDENTIFY_CONTROL, IDENTIFY_CONTROL_LOCALE, IDENTIFY_RESULT_CONTROL, type IdentifyResultGrouped, type IdentifyResultLayerItem, type IdentifyResultUpdatePayload } from '@hungpvq/map-dataset/identify';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  defaultMapProps,
  MapControlButton,
  ModuleContainer,
  UniversalRegistry,
  useCoordinate,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow
} from '@hungpvq/react-map-core';
import { InputSelect } from '@hungpvq/react-map-core/fields';
import { mdiCursorPointer, mdiSelect } from '@mdi/js';
import Icon from '@mdi/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DatasetMenuButton } from '../../extra/menu/dataset-menu-button';

const ICON_SIZE = 16 / 24;
function runIdentifyAction(mapId: string, type: string, event?: unknown) {
  UniversalRegistry.runControlAction(mapId, IDENTIFY_CONTROL.id, type, event);
}

export function IdentifyResultControl(props: WithMapPropType) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps } = useMap({
    ...merged,
    controlId: IDENTIFY_RESULT_CONTROL.id,
  });
  const { trans, setLocaleDefault } = useLang(mapId);
  const { format: formatCoordinate } = useCoordinate(mapId);
  const [show, toggleShow] = useShow(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [items, setItems] = useState<IdentifyResultGrouped[]>([]);
  const [origin, setOrigin] = useState({ latitude: 0, longitude: 0 });
  const [layerItems, setLayerItems] = useState<IdentifyResultLayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState(
    IDENTIFY_ALL_LAYERS_VALUE,
  );
  const [isEventClickActive, setIsEventClickActive] = useState(false);
  const [isEventClickBox, setIsEventClickBox] = useState(false);
  const [focusedChildKey, setFocusedChildKey] = useState<string | null>(null);

  useEffect(() => {
    setLocaleDefault(IDENTIFY_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  const flatChildren = useMemo(() => {
    const out: Array<{
      key: string;
      child: IdentifyResultGrouped['items'][number];
    }> = [];
    for (const group of items) {
      for (const child of group.items) {
        out.push({ key: `${group.id}:${child.id}`, child });
      }
    }
    return out;
  }, [items]);

  const applyUpdate = useCallback(
    (payload?: IdentifyResultUpdatePayload) => {
      if (!payload) return;
      if (payload.show != null) toggleShow(payload.show);
      if (payload.loading != null) setLoading(payload.loading);
      if (payload.error !== undefined) setErrorMessage(payload.error);
      if (payload.items !== undefined) {
        setItems(payload.items);
        setFocusedChildKey((prev) => {
          if (prev) return prev;
          const first = payload.items?.[0]?.items[0];
          if (first && payload.items?.[0]) {
            return `${payload.items[0].id}:${first.id}`;
          }
          return prev;
        });
      }
      if (payload.origin) setOrigin(payload.origin);
      if (payload.layerItems) setLayerItems(payload.layerItems);
      if (payload.selectedLayerId != null) {
        setSelectedLayerId(payload.selectedLayerId);
      }
      if (payload.isEventClickActive != null) {
        setIsEventClickActive(payload.isEventClickActive);
      }
      if (payload.isEventClickBox != null) {
        setIsEventClickBox(payload.isEventClickBox);
      }
    },
    [toggleShow],
  );

  const { panelBind } = useRegisterMapControl(mapId, {
    id: IDENTIFY_RESULT_CONTROL.id,
    panelKind: 'popup',
    title: trans('map.identify.title'),
    buttonPosition: merged.position,
    show,
    setShow: toggleShow,
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
    }),
    actions: [
      {
        type: IDENTIFY_RESULT_CONTROL.actionUpdate,
        run: (event) =>
          applyUpdate(event as IdentifyResultUpdatePayload | undefined),
      },
    ],
  });

  const currentPoint = useMemo(() => {
    const point = formatCoordinate(origin);
    return `${point.longitude}, ${point.latitude}`;
  }, [origin, formatCoordinate]);

  const hasSelectedPoint = origin.latitude !== 0 || origin.longitude !== 0;

  function onClose() {
    toggleShow(false);
    runIdentifyAction(mapId, IDENTIFY_CONTROL.actionClose);
  }

  function onMenuAction(
    child: {
      id: string | number;
      data: unknown;
      identify: IIdentifyView;
    },
    menu: MenuAction,
    event?: React.MouseEvent | KeyboardEvent,
  ) {
    const nativeEvent =
      event && 'nativeEvent' in event ? event.nativeEvent : event;

    handleMenuAction(menu, {
      event: nativeEvent,
      layer: child.identify,
      mapId,
      value: child.data,
    });
  }

  function getItemMenus(identify: IIdentifyView) {
    const ctx = createMenuConditionContext(identify, { mapId });
    return getResolvedMenus(identify, 'item').filter(
      (menu) => !isMenuItemHidden(menu, ctx),
    );
  }

  function onResultKeydown(event: React.KeyboardEvent) {
    if (!flatChildren.length) return;
    const keys = flatChildren.map((x) => x.key);
    const index = focusedChildKey ? keys.indexOf(focusedChildKey) : -1;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = keys[Math.min(keys.length - 1, Math.max(0, index) + 1)];
      setFocusedChildKey(next);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const next = keys[Math.max(0, (index < 0 ? 0 : index) - 1)];
      setFocusedChildKey(next);
    } else if (event.key === 'Enter' && focusedChildKey) {
      event.preventDefault();
      const hit = flatChildren.find((x) => x.key === focusedChildKey);
      if (!hit) return;
      const menus = getItemMenus(hit.child.identify);
      if (menus[0]) onMenuAction(hit.child, menus[0], event);
    }
  }

  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) =>
        show ? (
          <DraggableItemPopup
            show={show}
            onUpdateShow={(v) => {
              if (!v) toggleShow(false);
              else toggleShow(true);
            }}
            onClose={onClose}
            title={trans('map.identify.title')}
            width={400}
            height={300}
            extraBtn={
              <>
                <MapControlButton variant="plain"
                  active={isEventClickActive}
                  disabled={isEventClickActive}
                  title={trans('map.identify.map_click')}
                  onClick={(e) => {
                    e.stopPropagation();
                    runIdentifyAction(
                      mapId,
                      IDENTIFY_CONTROL.actionUseMapClick,
                    );
                  }}
                >
                  <Icon path={mdiCursorPointer} size={ICON_SIZE} />
                </MapControlButton>
                <MapControlButton variant="plain"
                  active={isEventClickBox}
                  disabled={isEventClickBox}
                  title={trans('map.identify.box_select')}
                  onClick={(e) => {
                    e.stopPropagation();
                    runIdentifyAction(
                      mapId,
                      IDENTIFY_CONTROL.actionUseBoxSelect,
                    );
                  }}
                >
                  <Icon path={mdiSelect} size={ICON_SIZE} />
                </MapControlButton>
              </>
            }
            {...bind}
            {...panelBind}
          >
            <div className="identify-control-container">
              <div className="identify-control-header">
                <div className="identify-control-header__row">
                  <b>{trans('map.identify.point')}:</b>
                  <span>{currentPoint}</span>
                </div>
                {layerItems.length > 0 ? (
                  <div className="identify-control-header__layer">
                    <InputSelect
                      label={trans('map.identify.layer')}
                      items={layerItems}
                      value={selectedLayerId}
                      onChange={(value) => {
                        const next = String(value);
                        setSelectedLayerId(next);
                        runIdentifyAction(
                          mapId,
                          IDENTIFY_CONTROL.actionSetLayerFilter,
                          {
                            identifyId:
                              next === IDENTIFY_ALL_LAYERS_VALUE
                                ? undefined
                                : next,
                          },
                        );
                      }}
                    />
                  </div>
                ) : null}
              </div>
              <hr className="identify-control-separator" aria-hidden="true" />
              <div
                className="identify-control-body"
                tabIndex={0}
                role="region"
                aria-label={trans('map.identify.title')}
                onKeyDown={onResultKeydown}
              >
                {loading ? (
                  <div className="identify-control-state" role="status" aria-live="polite">
                    <div className="identify-control-state__content">
                      <div className="identify-control-state__loading" aria-hidden="true" />
                      <span>{trans('map.identify.loading')}</span>
                    </div>
                  </div>
                ) : errorMessage ? (
                  <div className="identify-control-state" role="alert">
                    <div className="identify-control-state__content">
                      <span>
                        {errorMessage || trans('map.identify.error')}
                      </span>
                    </div>
                  </div>
                ) : !hasSelectedPoint ? (
                  <div className="identify-control-state">
                    <div className="identify-control-state__content">
                      <span>{trans('map.identify.no_selection')}</span>
                    </div>
                  </div>
                ) : items.length === 0 ? (
                  <div className="identify-control-state">
                    <div className="identify-control-state__content">
                      <span>
                        {selectedLayerId !== IDENTIFY_ALL_LAYERS_VALUE
                          ? trans('map.identify.no_data_filtered')
                          : trans('map.identify.no_data')}
                      </span>
                    </div>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="identify-control-list-item">
                      <div className="identify-control-list-item__container">
                        <div
                          className="identify-control-list-item__header"
                          title={item.name}
                        >
                          {item.name || '---'}
                        </div>
                        <div className="identify-control-list-item__child-container">
                          {item.items.map((child) => {
                            const childKey = `${item.id}:${child.id}`;
                            return (
                              <div
                                key={String(child.id)}
                                className={`identify-control-child-item${
                                  focusedChildKey === childKey
                                    ? ' is-focused'
                                    : ''
                                }`}
                                title={child.name || String(child.id)}
                                role="button"
                                tabIndex={0}
                                onClick={() => setFocusedChildKey(childKey)}
                              >
                                <span className="identify-control-child-item__name">
                                  {child.name || String(child.id) || '---'}
                                </span>
                                <div className="identify-control-child-item__spacer" />
                                <div
                                  className="identify-control-child-item__action"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {getItemMenus(child.identify).map(
                                    (menu, i) => (
                                      <DatasetMenuButton
                                        key={i}
                                        menu={menu}
                                        item={child.identify}
                                        mapId={mapId}
                                        onClick={(event) =>
                                          onMenuAction(child, menu, event)
                                        }
                                      />
                                    ),
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
