import type { BaseMapItem } from '@hungpvq/map-core';
import {
  INIT_BASEMAPS,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { Icon } from '@mdi/react';
import { mdiLayersOutline } from '@mdi/js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MapCard,
  MapControlButton,
  MapIcon,
  MapImage,
} from '../../../components';
import { useLang } from '../../useLang';
import { getMaps } from '../../../store/store';
import { getMapCompareSetting } from '../../compare';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules';
import { useBaseMap } from '../hooks';
import type { BindPosition } from '../../../modules/ModuleContainer/ModuleContainer';

const SIZE_BASE_MAP = 70;

export interface CompareBaseMapControlProps extends WithMapPropType {
  baseMaps?: BaseMapItem[];
  title?: string;
  defaultBaseMap?: string;
  controlIcon?: string;
}

export function CompareBaseMapControl({
  baseMaps = INIT_BASEMAPS,
  title = '',
  defaultBaseMap = 'Open Street Map',
  controlIcon = '',
  ...mapProps
}: CompareBaseMapControlProps) {
  const props = {
    ...defaultMapProps,
    ...mapProps,
    baseMaps,
    title,
    defaultBaseMap,
    controlIcon,
  };
  const { mapId, moduleContainerProps } = useMap(props);
  const { trans, setLocaleDefault } = useLang(mapId);
  const setting = getMapCompareSetting(mapId);
  const [currentTab, setCurrentTab] = useState(0);
  const mapIds = useMemo(
    () => getMaps(mapId).map((x) => x.id),
    [mapId]
  );

  // Support up to 4 compare maps - hooks must be called unconditionally
  const mapId0 = mapIds[0] ?? mapId;
  const mapId1 = mapIds[1] ?? mapId0;
  const mapId2 = mapIds[2] ?? mapId1;
  const mapId3 = mapIds[3] ?? mapId2;
  const useBaseMap0 = useBaseMap(mapId0);
  const useBaseMap1 = useBaseMap(mapId1);
  const useBaseMap2 = useBaseMap(mapId2);
  const useBaseMap3 = useBaseMap(mapId3);

  const mapStoreUseBaseMap = useMemo(
    () => [useBaseMap0, useBaseMap1, useBaseMap2, useBaseMap3].slice(0, mapIds.length),
    [mapIds.length, useBaseMap0, useBaseMap1, useBaseMap2, useBaseMap3]
  );

  const current_baseMaps = useMemo(
    () => mapStoreUseBaseMap.map((x) => x.currentBaseMap),
    [mapStoreUseBaseMap]
  );

  const c_items_baseMaps = useMemo(
    () => mapStoreUseBaseMap.map((x) => x.baseMaps),
    [mapStoreUseBaseMap]
  );

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

  useEffect(() => {
    if (props.baseMaps) {
      mapStoreUseBaseMap.forEach((c) => c.setBaseMaps(props.baseMaps!));
    }
  }, [props.baseMaps]);

  useEffect(() => {
    if (props.defaultBaseMap) {
      mapStoreUseBaseMap.forEach((c) =>
        c.setDefaultBaseMap(props.defaultBaseMap)
      );
    }
  }, [props.defaultBaseMap]);

  const [show, setShow] = useState(false);

  const onClick = useCallback(
    (i: number, baseMap: BaseMapItem) => {
      mapStoreUseBaseMap[i].setCurrent(baseMap);
    },
    [mapStoreUseBaseMap]
  );

  const onToggleList = useCallback(() => {
    setShow((s) => !s);
  }, []);

  useEffect(() => {
    mapStoreUseBaseMap.forEach((c) => {
      c.init(props.baseMaps, props.defaultBaseMap);
    });
    return () => {
      mapStoreUseBaseMap.forEach((x) => x.remove());
    };
  }, []);

  const draggableContent = useCallback(
    (bindDrag: BindPosition) => (
      <DraggableItemPopup
        show={show}
        onUpdateShow={setShow}
        containerId={bindDrag.containerId}
        title={trans('map.basemap.setting')}
        width={SIZE_BASE_MAP * 3 + 24}
        height={SIZE_BASE_MAP * 2 + 48 + 10 + 40}
        sticks={[]}
        disabledExpand
        top={bindDrag.top}
        left={bindDrag.left}
        bottom={bindDrag.bottom}
        right={bindDrag.right}
      >
        <div className="control-container">
          <div className="tabs-container">
            {c_items_baseMaps.map((_, i) => (
              <div
                key={i}
                className={`tab-item ${currentTab === i ? '_active' : ''}`}
                onClick={() => setCurrentTab(i)}
              >
                #{i + 1}
              </div>
            ))}
          </div>
          <div className="basemap-container">
            <div className="base-map-control-setting">
              {c_items_baseMaps[currentTab]?.map((baseMap) => (
                <div
                  key={baseMap.id}
                  className={`clickable base-map-control-setting-item ${
                    current_baseMaps[currentTab] &&
                    baseMap.id === current_baseMaps[currentTab]?.id
                      ? 'base-map-control-setting-item__active'
                      : ''
                  }`}
                  style={{ width: SIZE_BASE_MAP + 'px' }}
                  title={baseMap.title}
                  onClick={() => onClick(currentTab, baseMap)}
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
          </div>
        </div>
      </DraggableItemPopup>
    ),
    [
      show,
      c_items_baseMaps,
      current_baseMaps,
      currentTab,
      trans,
      onClick,
    ]
  );

  const current_baseMaps_for_display = current_baseMaps.filter(Boolean);

  const btnContent = current_baseMaps_for_display.length ? (
    <MapControlButton tooltip={title} onClick={onToggleList}>
      <MapCard
        className="clickable base-map-button__container"
        height="70px"
        width="70px"
      >
        <div className="base-map-button__content">
          <MapImage>
            <div
              className={`base-map-item-image-container ${
                setting?.vertical ? '_vertical' : ''
              }`}
            >
              {current_baseMaps_for_display.map((item, i) => (
                <MapImage
                  key={i}
                  src={item?.thumbnail}
                  className="base-map-item-image"
                />
              ))}
            </div>
            <div className="base-map-button__title">
              {controlIcon ? (
                <MapIcon dark small>
                  {controlIcon}
                </MapIcon>
              ) : (
                <Icon path={mdiLayersOutline} size={1} />
              )}
              <div>{title || trans('map.basemap.title')}</div>
            </div>
          </MapImage>
        </div>
      </MapCard>
    </MapControlButton>
  ) : null;

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btnWidth={70}
      btn={btnContent}
      draggable={draggableContent}
    >
      <style>{`
        .base-map-button__title {
          position: absolute;
          padding-bottom: 4px;
          bottom: 0;
          width: 100%;
          text-align: center;
          overflow: hidden;
          color: var(--map-card-text, var(--map-text-primary, #333));
          background-image: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
        }
        .base-map-button__title > div {
          font-size: 0.6rem;
        }
        .base-map-button__content {
          padding: 2px;
        }
        .base-map-control-setting {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-evenly;
        }
        .base-map-control-setting-item__title {
          font-size: 0.75rem !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          width: 100%;
        }
        .base-map-control-setting-item__active {
          color: var(--map-basemap-active-color, var(--map-primary-color, #1a73e8)) !important;
        }
        .tabs-container {
          display: flex;
          border-bottom-width: thin;
          border-bottom-color: var(--map-divider-color, #eeeeee);
          border-bottom-style: solid;
        }
        .tab-item {
          flex-grow: 1;
          padding: 8px 16px;
          text-align: center;
        }
        .basemap-container {
          overflow: auto;
          flex: 1 1 auto;
        }
        .control-container {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: 100%;
        }
        .base-map-item-image-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
        }
        .base-map-item-image-container._vertical {
          flex-direction: column;
        }
      `}</style>
    </ModuleContainer>
  );
}
