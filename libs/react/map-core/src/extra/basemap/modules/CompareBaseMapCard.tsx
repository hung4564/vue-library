import type { BaseMapItem } from '@hungpvq/map-core';
import React, { useCallback, useEffect, useMemo } from 'react';
import { MapImage } from '../../../components';
import { InputSelect } from '../../../field';
import { useMap } from '../../../hooks/useMap';
import { getMaps } from '../../../store/store';
import { getMapCompareSetting } from '../../compare';
import { useBaseMap } from '../hooks';

export interface CompareBaseMapCardProps {
  mapId: string;
  title?: string;
}

export function CompareBaseMapCard({
  mapId,
  title = '',
}: CompareBaseMapCardProps) {
  const { mapId: resolvedMapId } = useMap({ mapId });
  const setting = getMapCompareSetting(resolvedMapId);
  const mapIds = useMemo(
    () => getMaps(resolvedMapId).map((x) => x.id),
    [resolvedMapId],
  );

  const mapId0 = mapIds[0] ?? resolvedMapId;
  const mapId1 = mapIds[1] ?? mapId0;
  const mapId2 = mapIds[2] ?? mapId1;
  const mapId3 = mapIds[3] ?? mapId2;
  const useBaseMap0 = useBaseMap(mapId0);
  const useBaseMap1 = useBaseMap(mapId1);
  const useBaseMap2 = useBaseMap(mapId2);
  const useBaseMap3 = useBaseMap(mapId3);

  const mapStoreUseBaseMap = useMemo(
    () =>
      [useBaseMap0, useBaseMap1, useBaseMap2, useBaseMap3].slice(
        0,
        mapIds.length,
      ),
    [mapIds.length, useBaseMap0, useBaseMap1, useBaseMap2, useBaseMap3],
  );

  const current_baseMaps = useMemo(
    () => mapStoreUseBaseMap.map((x) => x.currentBaseMap),
    [mapStoreUseBaseMap],
  );

  const c_items_baseMaps = useMemo(
    () => mapStoreUseBaseMap.map((x) => x.baseMaps),
    [mapStoreUseBaseMap],
  );

  const onChangeBaseMap = useCallback(
    (i: number, value: BaseMapItem | string | number) => {
      const baseMap = c_items_baseMaps[i]?.find(
        (b) => String(b.id) === String(value),
      );
      if (baseMap) {
        mapStoreUseBaseMap[i].setCurrent(baseMap);
      }
    },
    [c_items_baseMaps, mapStoreUseBaseMap],
  );

  useEffect(() => {
    return () => {
      mapStoreUseBaseMap.forEach((x) => x.remove());
    };
  }, [mapStoreUseBaseMap]);

  return (
    <div className="base-map-card">
      <div className="base-map-card__image">
        {current_baseMaps.length > 0 && (
          <MapImage>
            <div
              className={`base-map-item-image-container ${
                setting?.vertical ? '_vertical' : ''
              }`}
            >
              {current_baseMaps.map(
                (item, i) =>
                  item && (
                    <MapImage
                      key={i}
                      src={item.thumbnail}
                      className="base-map-item-image"
                    />
                  ),
              )}
            </div>
          </MapImage>
        )}
      </div>
      <div className="base-map-card__content">
        {c_items_baseMaps.map((baseMaps, i) => (
          <div key={i} className="base-map-card__item">
            <div>#{i + 1}</div>
            <div>
              <InputSelect<BaseMapItem>
                value={current_baseMaps[i]?.id}
                items={baseMaps}
                itemValue="id"
                itemText="title"
                onChange={(value) => onChangeBaseMap(i, value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
