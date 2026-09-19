import type { BaseMapItem } from '@hungpvq/map-core/basemap';
import { logHelper, type WithMapPropType } from '@hungpvq/map-core';
import {
  BASEMAP_CONTROL_LOCALE,
  INIT_BASEMAPS,
} from '@hungpvq/map-core/basemap';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { mdiLayersOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapCard } from '../../../components/MapCard';
import { MapControlButton } from '../../../components/MapControlButton';
import { MapIcon } from '../../../components/MapIcon';
import { MapImage } from '../../../components/MapImage';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import type { BindPosition } from '../../../modules/ModuleContainer/ModuleContainer';
import { useLang } from '../../lang/hook';
import { useRegisterMapControl } from '../../registry/useRegisterMapControl';
import { useToolbarControl } from '../../toolbar/helper';
import { useBaseMap } from '../hooks/useBaseMap';
import { logger } from '../logger';

const SIZE_BASE_MAP = 70;

export interface BaseMapControlProps extends WithMapPropType {
  baseMaps?: BaseMapItem[];
  title?: string;
  defaultBaseMap?: string;
  controlIcon?: string;
}

export function BaseMapControl({
  baseMaps = INIT_BASEMAPS,
  title = '',
  defaultBaseMap = 'Open Street Map',
  controlIcon = '',
  ...mapProps
}: BaseMapControlProps) {
  const props = {
    ...defaultMapProps,
    ...mapProps,
    baseMaps,
    title,
    defaultBaseMap,
    controlIcon,
  };
  const { mapId, moduleContainerProps, order, mapInstance } = useMap({ ...props, controlId: 'mapBaseMapControl' });
  const { trans, registerLocale } = useLang(mapId);
  const {
    setBaseMaps,
    baseMaps: c_baseMaps,
    setDefaultBaseMap,
    setCurrent,
    currentBaseMap: current_baseMaps,
    remove,
    init,
  } = useBaseMap(mapId);

  useEffect(() => {
    setBaseMaps(props.baseMaps as BaseMapItem[]);
  }, [props.baseMaps, setBaseMaps]);

  useEffect(() => {
    setDefaultBaseMap(props.defaultBaseMap);
  }, [props.defaultBaseMap, setDefaultBaseMap]);

  useEffect(() => {
    registerLocale('en', BASEMAP_CONTROL_LOCALE);
  }, [registerLocale]);

  const [show, setShow] = useState(false);
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
    }),
    actions: [{ type: 'mapBaseMapControl', run: () => setShow((s) => !s) }],
  });

  const onClick = useCallback(
    (baseMap: BaseMapItem) => {
      logHelper(logger, mapId, 'control', 'BaseMapControl')
        .with({ fn: 'onClick', span: 'control.event' })
        .debug('onClick', baseMap);
      setCurrent(baseMap);
    },
    [mapId, setCurrent],
  );

  const onToggleList = useCallback(() => {
    setShow((s) => !s);
  }, []);

  // Init once when map is ready (matches Vue onMounted); do not re-init on every render
  useEffect(() => {
    if (!mapInstance) return;
    init(props.baseMaps as BaseMapItem[], props.defaultBaseMap);
    return () => remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount with map only
  }, [mapInstance]);

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

  const draggableContent = useCallback(
    (bindDrag: BindPosition) => (
      <DraggableItemPopup
        show={show}
        onUpdateShow={setShow}
        title={trans('map.basemap.setting')}
        width={SIZE_BASE_MAP * 3 + 24}
        height={
          SIZE_BASE_MAP * (Math.floor(c_baseMaps.length / 3) + 1) + 48 + 10
        }
        sticks={[]}
        disabledExpand
        {...bindDrag}
        {...panelBind}
      >
        <div className="base-map-control-setting">
          {c_baseMaps.map((baseMap) => (
            <div
              key={baseMap.id}
              className="clickable base-map-control-setting-item"
              style={{ width: SIZE_BASE_MAP + 'px' }}
              title={baseMap.title}
              onClick={() => onClick(baseMap)}
            >
              <div
                style={{
                  width: SIZE_BASE_MAP - 34 + 'px',
                  height: SIZE_BASE_MAP - 34 + 'px',
                }}
              >
                <MapImage src={baseMap.thumbnail} />
              </div>
              <div
                className={`base-map-control-setting-item__title${
                  current_baseMaps && baseMap.id === current_baseMaps.id
                    ? ' base-map-control-setting-item__active'
                    : ''
                }`}
              >
                {baseMap.title}
              </div>
            </div>
          ))}
        </div>
      </DraggableItemPopup>
    ),
    [show, c_baseMaps, current_baseMaps, trans, onClick, panelBind],
  );

  // Logic mặc định: lấy map thỏa mãn defaultBaseMap (b.default hoặc b.title === defaultBaseMap), nếu không thì lấy phần tử đầu
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
