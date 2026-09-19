import type { BaseMapItem } from '@hungpvq/map-core/basemap';
import { logHelper } from '@hungpvq/map-core';
import React, { useCallback, useEffect } from 'react';
import { MapImage } from '../../../components/MapImage';
import { InputSelect } from '../../../field';
import { useMap } from '../../../hooks/useMap';
import { useLang } from '../../lang/hook';
import { useBaseMap } from '../hooks/useBaseMap';
import { logger } from '../logger';

export interface BaseMapCardProps {
  mapId: string;
  title?: string;
}

export function BaseMapCard({ mapId, title = '' }: BaseMapCardProps) {
  const { mapId: resolvedMapId } = useMap({ mapId });
  const { trans } = useLang(resolvedMapId);
  const {
    baseMaps: c_baseMaps,
    setCurrent,
    currentBaseMap: current_baseMaps,
    remove,
  } = useBaseMap(resolvedMapId);

  const onChangeBaseMap = useCallback(
    (value: BaseMapItem | string | number) => {
      const baseMap = c_baseMaps.find((b) => String(b.id) === String(value));
      if (baseMap) {
        logHelper(logger, resolvedMapId, 'control', 'BaseMapCard')
          .with({ fn: 'onChangeBaseMap', span: 'control.event' })
          .debug('onClick', baseMap);
        setCurrent(baseMap);
      }
    },
    [c_baseMaps, resolvedMapId, setCurrent],
  );

  useEffect(() => {
    return () => remove();
  }, [remove]);

  return (
    <div className="base-map-card">
      <div className="base-map-card__image">
        {current_baseMaps && <MapImage src={current_baseMaps.thumbnail} />}
      </div>
      <div className="base-map-card__content">
        <div className="base-map-card__title">
          {title || trans('map.basemap.title')}
        </div>
        <div>
          <InputSelect<BaseMapItem>
            value={current_baseMaps?.id}
            items={c_baseMaps}
            itemValue="id"
            itemText="title"
            onChange={onChangeBaseMap}
          />
        </div>
      </div>
    </div>
  );
}
