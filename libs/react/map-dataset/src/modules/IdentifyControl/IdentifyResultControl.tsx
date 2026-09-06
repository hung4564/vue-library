import type { WithMapPropType } from '@hungpvq/map-core';
import type { IIdentifyView, MenuAction } from '@hungpvq/map-dataset';
import {
  handleMenuAction,
  IDENTIFY_ALL_LAYERS_VALUE,
  IDENTIFY_CONTROL,
  IDENTIFY_CONTROL_LOCALE,
  IDENTIFY_RESULT_CONTROL,
  LIST_VIEW_MENU_ID,
  type IdentifyResultGrouped,
  type IdentifyResultLayerItem,
  type IdentifyResultUpdatePayload,
} from '@hungpvq/map-dataset';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  BaseButton,
  defaultMapProps,
  InputSelect,
  ModuleContainer,
  UniversalRegistry,
  useCoordinate,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
} from '@hungpvq/react-map-core';
import { mdiCursorPointer, mdiSelect } from '@mdi/js';
import Icon from '@mdi/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IdentifyMenuItem } from './IdentifyMenuItem';

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
  const [items, setItems] = useState<IdentifyResultGrouped[]>([]);
  const [origin, setOrigin] = useState({ latitude: 0, longitude: 0 });
  const [layerItems, setLayerItems] = useState<IdentifyResultLayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState(
    IDENTIFY_ALL_LAYERS_VALUE,
  );
  const [isEventClickActive, setIsEventClickActive] = useState(false);
  const [isEventClickBox, setIsEventClickBox] = useState(false);

  useEffect(() => {
    setLocaleDefault(IDENTIFY_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  const applyUpdate = useCallback(
    (payload?: IdentifyResultUpdatePayload) => {
      if (!payload) return;
      if (payload.show != null) toggleShow(payload.show);
      if (payload.loading != null) setLoading(payload.loading);
      if (payload.items !== undefined) setItems(payload.items);
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
    return `${point.longitude}, &nbsp;${point.latitude}`;
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
    event?: React.MouseEvent,
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
                <BaseButton
                  active={isEventClickActive}
                  disabled={isEventClickActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    runIdentifyAction(
                      mapId,
                      IDENTIFY_CONTROL.actionUseMapClick,
                    );
                  }}
                >
                  <Icon path={mdiCursorPointer} size={ICON_SIZE} />
                </BaseButton>
                <BaseButton
                  active={isEventClickBox}
                  disabled={isEventClickBox}
                  onClick={(e) => {
                    e.stopPropagation();
                    runIdentifyAction(
                      mapId,
                      IDENTIFY_CONTROL.actionUseBoxSelect,
                    );
                  }}
                >
                  <Icon path={mdiSelect} size={ICON_SIZE} />
                </BaseButton>
              </>
            }
            {...bind}
            {...panelBind}
          >
            <div className="identify-control-container">
              <div className="identify-control-header">
                <div className="identify-control-header__row">
                  <b>{trans('map.identify.point')}:</b>
                  <span dangerouslySetInnerHTML={{ __html: currentPoint }} />
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
                ) : items.length === 0 ? (
                  <div className="identify-control-state">
                    <div className="identify-control-state__content">
                      <span>{trans('map.identify.no_data')}</span>
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
                          {item.items.map((child) => (
                            <div
                              key={String(child.id)}
                              className="identify-control-child-item"
                              title={child.name || String(child.id)}
                              role="button"
                              tabIndex={0}
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
                                      onMenuAction(child, menu, event)
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
