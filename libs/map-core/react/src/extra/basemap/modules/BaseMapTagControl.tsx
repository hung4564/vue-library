import { logHelper, type WithMapPropType } from '@hungpvq/map-core';
import {
  type BaseMapItem,
  INIT_BASEMAPS,
  logger,
} from '@hungpvq/map-core/basemap';
import { mdiLayersOutline } from '@mdi/js';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import React, { useCallback, useEffect, useMemo } from 'react';

import { MapControlGroupButton } from '../../../components/MapControlGroupButton';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useMapControl } from '../../registry/useMapControl';
import { useBaseMap } from '../hooks/useBaseMap';

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
  const { mapId, mapInstance, order } = useMap(props);
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
      logHelper(logger, mapId, 'control', 'BaseMapTagControl')
        .with({ fn: 'onClick', span: 'control.event' })
        .debug('onClick', baseMap);
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

  const baseMapTagModule = useMemo(
    () => ({
      kind: 'module' as const,
      moduleId: 'mapBaseMapTagControl',
      order,
      orientation: 'row' as const,
      buttons: (baseMaps as BaseMapItem[]).map((baseMap) => ({
        id: String(baseMap.id),
        getState: () => {
          const live =
            c_baseMaps.find((item) => item.id === baseMap.id) ?? baseMap;
          return mdiButtonState(mdiLayersOutline, {
            visible: true,
            active: current_baseMaps?.id === live.id,
            title: live.title,
          });
        },
        onClick: () => {
          const live =
            c_baseMaps.find((item) => item.id === baseMap.id) ?? baseMap;
          onClick(live);
        },
      })),
    }),
    [baseMaps, c_baseMaps, current_baseMaps, onClick, order],
  );

  const { moduleContainerProps, control } = useMapControl(mapId, {
    id: 'mapBaseMapTagControl',
    panelKind: 'button',
    from: props,
    order,
    host: {
      buttonSlot: 'custom',
      button: baseMapTagModule,
    },
    toolbar: baseMapTagModule,
  });

  useEffect(() => {
    control.sync();
  }, [current_baseMaps, c_baseMaps, control]);

  const btnContent = current_baseMaps ? (
    <MapControlGroupButton
      row
      size={24}
    >
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
    <ModuleContainer
      {...moduleContainerProps}
      btnWidth={24}
      btn={btnContent}
    />
  );
}
