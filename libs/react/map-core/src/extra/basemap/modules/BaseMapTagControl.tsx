import type { BaseMapItem } from '@hungpvq/map-core/basemap';
import { logHelper, type WithMapPropType } from '@hungpvq/map-core';
import { INIT_BASEMAPS } from '@hungpvq/map-core/basemap';
import { mdiLayersOutline } from '@mdi/js';
import React, { useCallback, useEffect } from 'react';
import { MapControlGroupButton } from '../../../components';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules';
import { useToolbarControl } from '../../toolbar';
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
  const { mapId, moduleContainerProps, mapInstance, order } = useMap(props);
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

  const { control } = useToolbarControl(mapId, props, {
    kind: 'module',
    moduleId: 'mapBaseMapTagControl',
    order: order,
    orientation: 'row',
    buttons: (baseMaps as BaseMapItem[]).map((baseMap) => ({
      id: String(baseMap.id),
      getState: () => {
        const live =
          c_baseMaps.find((item) => item.id === baseMap.id) ?? baseMap;
        return {
          visible: true,
          active: current_baseMaps?.id === live.id,
          title: live.title,
          icon: { type: 'mdi' as const, path: mdiLayersOutline },
        };
      },
      onClick: () => {
        const live =
          c_baseMaps.find((item) => item.id === baseMap.id) ?? baseMap;
        onClick(live);
      },
    })),
  });

  useEffect(() => {
    control.sync();
  }, [current_baseMaps, c_baseMaps, control]);

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
