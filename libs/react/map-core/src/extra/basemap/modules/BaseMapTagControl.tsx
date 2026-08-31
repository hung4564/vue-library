import type { BaseMapItem } from '@hungpvq/map-core';
import {
  INIT_BASEMAPS,
  logHelper,
  type WithMapPropType,
} from '@hungpvq/map-core';
import React, { useCallback, useEffect } from 'react';
import { MapControlGroupButton } from '../../../components';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules';
import { useBaseMap } from '../hooks';
import { logger } from '../logger';

export interface BaseMapTagControlProps extends WithMapPropType {
  baseMaps?: BaseMapItem[];
  defaultBaseMap?: string;
}

export function BaseMapTagControl({
  baseMaps = INIT_BASEMAPS,
  defaultBaseMap = 'Open Street Map',
  ...mapProps
}: BaseMapTagControlProps) {
  const props = {
    ...defaultMapProps,
    ...mapProps,
    baseMaps,
    defaultBaseMap,
  };
  const { mapId, moduleContainerProps, mapInstance } = useMap(props);
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

  const onClick = useCallback(
    (baseMap: BaseMapItem) => {
      logHelper(logger, mapId, 'control', 'BaseMapTagControl').debug(
        'onClick',
        baseMap,
      );
      setCurrent(baseMap);
    },
    [mapId, setCurrent],
  );

  useEffect(() => {
    if (!mapInstance) return;
    init(props.baseMaps, props.defaultBaseMap);
    return () => remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount with map only
  }, [mapInstance]);

  const btnContent = current_baseMaps ? (
    <MapControlGroupButton row size={24}>
      {c_baseMaps.map((baseMap) => (
        <button
          key={baseMap.id}
          type="button"
          className={`px-2 py-1 clickable base-map-item ${
            current_baseMaps && current_baseMaps.id === baseMap.id
              ? 'active'
              : ''
          }`}
          onClick={() => onClick(baseMap)}
        >
          {baseMap.title}
        </button>
      ))}
    </MapControlGroupButton>
  ) : null;

  return (
    <ModuleContainer {...moduleContainerProps} btnWidth={24} btn={btnContent} />
  );
}
