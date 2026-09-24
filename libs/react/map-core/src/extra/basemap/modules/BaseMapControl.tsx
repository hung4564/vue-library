import { logHelper, type WithMapPropType } from '@hungpvq/map-core';
import {
  type BaseMapItem,
  INIT_BASEMAPS,
  isCustomBasemapItem,
  logger,
} from '@hungpvq/map-core/basemap';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { mdiDelete, mdiLayersOutline, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MapCard } from '../../../components/MapCard';
import { MapControlButton } from '../../../components/MapControlButton';
import { MapIcon } from '../../../components/MapIcon';
import { MapImage } from '../../../components/MapImage';
import { MapRangeSlider } from '../../../field';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import type { BindPosition } from '../../../modules/ModuleContainer/ModuleContainer';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useLang } from '../../lang/hook';
import { useRegisterMapControl } from '../../registry/useRegisterMapControl';
import { useToolbarControl } from '../../toolbar/helper';
import { useBaseMap } from '../hooks/useBaseMap';
import { BaseMapAddForm } from './BaseMapAddForm';

const SIZE_BASE_MAP = 70;

export interface BaseMapControlProps extends WithMapPropType {
  baseMaps?: BaseMapItem[];
  title?: string;
  defaultBaseMap?: string;
  controlIcon?: string;
  /** Show basemap opacity slider in the settings popup. */
  showOpacity?: boolean;
  /** Allow adding a custom basemap via popup form. */
  allowAddBasemap?: boolean;
}

export function BaseMapControl({
  baseMaps = INIT_BASEMAPS,
  title = '',
  defaultBaseMap = 'Open Street Map',
  controlIcon = '',
  showOpacity = false,
  allowAddBasemap = false,
  ...mapProps
}: BaseMapControlProps) {
  const props = {
    ...defaultMapProps,
    ...mapProps,
    baseMaps,
    title,
    defaultBaseMap,
    controlIcon,
    showOpacity,
    allowAddBasemap,
  };
  const { mapId, moduleContainerProps, order, mapInstance } = useMap({
    ...props,
    controlId: 'mapBaseMapControl',
  });
  const { trans } = useLang(mapId);
  const {
    setBaseMaps,
    baseMaps: c_baseMaps,
    setDefaultBaseMap,
    setCurrent,
    currentBaseMap: current_baseMaps,
    opacity,
    setOpacity,
    addBaseMap,
    removeBaseMap,
    remove,
    init,
  } = useBaseMap(mapId);

  const [show, setShowState] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const setShow = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setShowState((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        if (!next) setShowAddForm(false);
        return next;
      });
    },
    [],
  );

  const { panelBind } = useRegisterMapControl(mapId, {
    id: 'mapBaseMapControl',
    panelKind: 'popup',
    title: title || trans('map.basemap.title'),
    buttonPosition: props.position,
    show,
    setShow,
    getProps: () => ({
      position: props.position,
      controlLayout: props.controlLayout,
      defaultBaseMap: props.defaultBaseMap,
      showOpacity: props.showOpacity,
      allowAddBasemap: props.allowAddBasemap,
    }),
    actions: [{ type: 'mapBaseMapControl', run: () => setShow((s) => !s) }],
  });

  const noneThumb = useMemo(
    () =>
      c_baseMaps.find((b) => b.type === 'no-basemap')?.thumbnail ||
      INIT_BASEMAPS.find((b) => b.type === 'no-basemap')?.thumbnail ||
      '',
    [c_baseMaps],
  );

  const isCustomPlaceholder = useCallback(
    (baseMap: BaseMapItem) => {
      if (!isCustomBasemapItem(baseMap)) return false;
      const thumb = (baseMap.thumbnail || '').trim();
      if (!thumb) return true;
      return thumb === noneThumb;
    },
    [noneThumb],
  );

  const onClick = useCallback(
    (baseMap: BaseMapItem) => {
      logHelper(logger, mapId, 'control', 'BaseMapControl')
        .with({ fn: 'onClick', span: 'control.event' })
        .debug('onClick', baseMap);
      setCurrent(baseMap);
    },
    [mapId, setCurrent],
  );

  const onBasemapAdded = useCallback(
    (item: BaseMapItem) => {
      addBaseMap(item);
      setCurrent(item);
      setShowAddForm(false);
      logHelper(logger, mapId, 'control', 'BaseMapControl')
        .with({ fn: 'onBasemapAdded', span: 'control.event' })
        .info('Custom basemap added', { id: item.id, type: item.type });
    },
    [addBaseMap, setCurrent, mapId],
  );

  const onRemoveBasemap = useCallback(
    (baseMap: BaseMapItem) => {
      if (!isCustomBasemapItem(baseMap)) return;
      removeBaseMap(baseMap.id);
      logHelper(logger, mapId, 'control', 'BaseMapControl')
        .with({ fn: 'onRemoveBasemap', span: 'control.event' })
        .info('Custom basemap removed', { id: baseMap.id });
    },
    [removeBaseMap, mapId],
  );

  const onToggleList = useCallback(() => {
    setShow((s) => !s);
  }, [setShow]);

  useEffect(() => {
    if (!mapInstance) return;
    init(props.baseMaps as BaseMapItem[], props.defaultBaseMap);
    return () => remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount with map only
  }, [mapInstance]);

  useEffect(() => {
    if (!mapInstance) return;
    setBaseMaps(props.baseMaps as BaseMapItem[]);
  }, [mapInstance, props.baseMaps, setBaseMaps]);

  useEffect(() => {
    if (!mapInstance) return;
    setDefaultBaseMap(props.defaultBaseMap);
  }, [mapInstance, props.defaultBaseMap, setDefaultBaseMap]);

  const { control } = useToolbarControl(mapId, props, {
    kind: 'single',
    id: 'mapBaseMapControl',
    getState: () =>
      mdiButtonState(mdiLayersOutline, {
        visible: true,
        active: show,
        order,
        title: title || trans('map.basemap.title'),
      }),
    onClick: onToggleList,
  });
  const controlRef = useRef(control);
  controlRef.current = control;

  useEffect(() => {
    controlRef.current.sync();
  }, [show]);

  const popupHeight = (() => {
    if (showAddForm) return 420;
    const tileCount = c_baseMaps.length + (allowAddBasemap ? 1 : 0);
    return (
      SIZE_BASE_MAP * (Math.floor(tileCount / 3) + 1) +
      48 +
      10 +
      (showOpacity ? 40 : 0)
    );
  })();

  const draggableContent = useCallback(
    (bindDrag: BindPosition) => (
      <DraggableItemPopup
        show={show}
        onUpdateShow={setShow}
        title={
          showAddForm ? trans('map.basemap.add') : trans('map.basemap.setting')
        }
        width={showAddForm ? 280 : SIZE_BASE_MAP * 3 + 24}
        height={popupHeight}
        sticks={[]}
        disabledExpand
        {...bindDrag}
        {...panelBind}
      >
        <div className="base-map-control-setting">
          {showAddForm ? (
            <BaseMapAddForm
              mapId={mapId}
              showHeading={false}
              onAdded={onBasemapAdded}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <>
              {c_baseMaps.map((baseMap) => {
                const isActive =
                  !!current_baseMaps && baseMap.id === current_baseMaps.id;
                const placeholder = isCustomPlaceholder(baseMap);
                return (
                  <div
                    key={baseMap.id}
                    className={`clickable base-map-control-setting-item${
                      isActive ? ' base-map-control-setting-item--active' : ''
                    }`}
                    style={{ width: SIZE_BASE_MAP + 'px' }}
                    title={baseMap.title}
                    onClick={() => onClick(baseMap)}
                  >
                    <div
                      className={`base-map-control-setting-item__thumb${
                        placeholder
                          ? ' base-map-control-setting-item__thumb--placeholder'
                          : ''
                      }`}
                      style={{
                        width: SIZE_BASE_MAP - 34 + 'px',
                        height: SIZE_BASE_MAP - 34 + 'px',
                      }}
                    >
                      {!placeholder ? (
                        <MapImage src={baseMap.thumbnail} />
                      ) : null}
                      {allowAddBasemap && isCustomBasemapItem(baseMap) ? (
                        <button
                          type="button"
                          className="base-map-control-setting-item__remove"
                          title={trans('map.basemap.remove')}
                          aria-label={trans('map.basemap.remove')}
                          onClick={(event) => {
                            event.stopPropagation();
                            onRemoveBasemap(baseMap);
                          }}
                        >
                          <Icon path={mdiDelete} size="18px" />
                        </button>
                      ) : null}
                    </div>
                    <div className="base-map-control-setting-item__title">
                      {baseMap.title}
                    </div>
                  </div>
                );
              })}
              {allowAddBasemap ? (
                <button
                  type="button"
                  className="clickable base-map-control-setting-item base-map-control-setting-item--add"
                  style={{ width: SIZE_BASE_MAP + 'px' }}
                  title={trans('map.basemap.add')}
                  aria-label={trans('map.basemap.add')}
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowAddForm(true);
                  }}
                >
                  <div
                    className="base-map-control-setting-item__thumb base-map-control-setting-item__thumb--add"
                    style={{
                      width: SIZE_BASE_MAP - 34 + 'px',
                      height: SIZE_BASE_MAP - 34 + 'px',
                    }}
                  >
                    <Icon path={mdiPlus} size="22px" />
                  </div>
                  <div className="base-map-control-setting-item__title">
                    {trans('map.basemap.add')}
                  </div>
                </button>
              ) : null}
              {showOpacity ? (
                <div
                  className="base-map-control-setting__opacity"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MapRangeSlider
                    aria-label={trans('map.basemap.opacity')}
                    value={opacity ?? 1}
                    onChange={setOpacity}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </DraggableItemPopup>
    ),
    [
      show,
      showAddForm,
      setShow,
      c_baseMaps,
      current_baseMaps,
      trans,
      onClick,
      panelBind,
      showOpacity,
      opacity,
      setOpacity,
      allowAddBasemap,
      popupHeight,
      mapId,
      onBasemapAdded,
      onRemoveBasemap,
      isCustomPlaceholder,
    ],
  );

  const getDefaultBaseMap = (maps: BaseMapItem[]) =>
    maps.find((b) => b.default || b.title === props.defaultBaseMap) ?? maps[0];

  const baseMapsSource =
    c_baseMaps.length > 0 ? c_baseMaps : (props.baseMaps as BaseMapItem[]);
  const displayBaseMap = current_baseMaps ?? getDefaultBaseMap(baseMapsSource);
  const btnContent = (
    <MapControlButton
      tooltip={title}
      active={show}
      contentButton={
        <MapCard
          className={`clickable base-map-button__container${
            show ? ' base-map-button__container--active' : ''
          }`}
          height="70px"
          width="70px"
          onClick={onToggleList}
        >
          <div className="base-map-button__content">
            <MapImage src={displayBaseMap.thumbnail}>
              <div className="base-map-button__title">
                {controlIcon ? (
                  <MapIcon>{controlIcon}</MapIcon>
                ) : (
                  <Icon path={mdiLayersOutline} size={1} />
                )}
                <div>{title || trans('map.basemap.title')}</div>
              </div>
            </MapImage>
          </div>
        </MapCard>
      }
    />
  );

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btnWidth={70}
      btn={btnContent}
      draggable={draggableContent}
    ></ModuleContainer>
  );
}
