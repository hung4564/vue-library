import type { BaseMapItem } from '@hungpvq/map-core';
import {
  INIT_BASEMAPS,
  logHelper,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { mdiLayersOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import React, { useCallback, useEffect, useState } from 'react';
import {
  MapCard,
  MapControlButton,
  MapIcon,
  MapImage,
} from '../../../components';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules';
import type { BindPosition } from '../../../modules/ModuleContainer/ModuleContainer';
import { useLang } from '../../lang';
import { useToolbarControl } from '../../toolbar';
import { useBaseMap } from '../hooks';
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
  const { mapId, moduleContainerProps, order, mapInstance } = useMap(props);
  const { trans, setLocaleDefault } = useLang(mapId);
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
    setLocaleDefault({
      map: {
        basemap: {
          title: 'Map basemap',
          setting: 'Setting',
        },
      },
    });
  }, [setLocaleDefault]);

  const [show, setShow] = useState(false);

  const onClick = useCallback(
    (baseMap: BaseMapItem) => {
      logHelper(logger, mapId, 'control', 'BaseMapControl').debug(
        'onClick',
        baseMap,
      );
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

  useToolbarControl(mapId, props, {
    kind: 'single',
    id: 'mapBaseMapControl',
    getState: () => ({
      visible: true,
      order,
      title: title || trans('map.basemap.title'),
      icon: {
        type: 'mdi' as const,
        path: mdiLayersOutline,
      },
    }),
    onClick: onToggleList,
  });

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
      >
        <div className="base-map-control-setting">
          {c_baseMaps.map((baseMap) => (
            <div
              key={baseMap.id}
              className={`clickable base-map-control-setting-item ${
                current_baseMaps && baseMap.id === current_baseMaps.id
                  ? 'base-map-control-setting-item__active'
                  : ''
              }`}
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
              <div className="base-map-control-setting-item__title">
                {baseMap.title}
              </div>
            </div>
          ))}
        </div>
      </DraggableItemPopup>
    ),
    [show, c_baseMaps, current_baseMaps, trans, onClick],
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
      contentButton={
        <MapCard
          className="clickable base-map-button__container"
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
