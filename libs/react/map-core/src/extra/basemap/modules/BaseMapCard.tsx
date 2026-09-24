import { logHelper } from '@hungpvq/map-core';
import {
  type BaseMapItem,
  INIT_BASEMAPS,
  isCustomBasemapItem,
  logger,
} from '@hungpvq/map-core/basemap';
import { mdiDelete, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { MapControlButton } from '../../../components/MapControlButton';
import { MapImage } from '../../../components/MapImage';
import { InputSelect, MapRangeSlider } from '../../../field';
import { useMap } from '../../../hooks/useMap';
import { useLang } from '../../lang/hook';
import { useBaseMap } from '../hooks/useBaseMap';
import { BaseMapAddForm } from './BaseMapAddForm';

export interface BaseMapCardProps {
  mapId: string;
  title?: string;
  /** Show basemap opacity slider. */
  showOpacity?: boolean;
  /** Allow adding a custom basemap via inline form. */
  allowAddBasemap?: boolean;
}

export function BaseMapCard({
  mapId,
  title = '',
  showOpacity = false,
  allowAddBasemap = false,
}: BaseMapCardProps) {
  const { mapId: resolvedMapId } = useMap({ mapId });
  const { trans } = useLang(resolvedMapId);
  const {
    baseMaps: c_baseMaps,
    setCurrent,
    currentBaseMap: current_baseMaps,
    opacity,
    setOpacity,
    addBaseMap,
    removeBaseMap,
    remove,
  } = useBaseMap(resolvedMapId);
  const [showAddForm, setShowAddForm] = useState(false);

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

  const onBasemapAdded = useCallback(
    (item: BaseMapItem) => {
      addBaseMap(item);
      setCurrent(item);
      setShowAddForm(false);
      logHelper(logger, resolvedMapId, 'control', 'BaseMapCard')
        .with({ fn: 'onBasemapAdded', span: 'control.event' })
        .info('Custom basemap added', { id: item.id, type: item.type });
    },
    [addBaseMap, setCurrent, resolvedMapId],
  );

  const onRemoveCurrent = useCallback(() => {
    if (!current_baseMaps || !isCustomBasemapItem(current_baseMaps)) return;
    removeBaseMap(current_baseMaps.id);
    logHelper(logger, resolvedMapId, 'control', 'BaseMapCard')
      .with({ fn: 'onRemoveCurrent', span: 'control.event' })
      .info('Custom basemap removed', { id: current_baseMaps.id });
  }, [current_baseMaps, removeBaseMap, resolvedMapId]);

  useEffect(() => {
    return () => remove();
  }, [remove]);

  const cardClass = [
    'base-map-card',
    showOpacity && !showAddForm ? 'base-map-card--with-opacity' : '',
    showAddForm ? 'base-map-card--adding' : '',
    allowAddBasemap && !showAddForm ? 'base-map-card--with-add' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (showAddForm) {
    return (
      <div className={cardClass}>
        <BaseMapAddForm
          mapId={resolvedMapId}
          onAdded={onBasemapAdded}
          onCancel={() => setShowAddForm(false)}
        />
      </div>
    );
  }

  const placeholder =
    !!current_baseMaps && isCustomPlaceholder(current_baseMaps);

  return (
    <div className={cardClass}>
      <div
        className={`base-map-card__image${
          placeholder ? ' base-map-card__image--placeholder' : ''
        }`}
      >
        {current_baseMaps && !placeholder ? (
          <MapImage src={current_baseMaps.thumbnail} />
        ) : null}
        {allowAddBasemap &&
        current_baseMaps &&
        isCustomBasemapItem(current_baseMaps) ? (
          <button
            type="button"
            className="base-map-card__remove"
            title={trans('map.basemap.remove')}
            aria-label={trans('map.basemap.remove')}
            onClick={(event) => {
              event.stopPropagation();
              onRemoveCurrent();
            }}
          >
            <Icon path={mdiDelete} size="18px" />
          </button>
        ) : null}
      </div>
      <div className="base-map-card__select">
        <div className="base-map-card__title">
          {title || trans('map.basemap.title')}
        </div>
        <InputSelect<BaseMapItem>
          value={current_baseMaps?.id}
          items={c_baseMaps}
          itemValue="id"
          itemText="title"
          onChange={onChangeBaseMap}
        />
      </div>
      {showOpacity ? (
        <div className="base-map-card__opacity">
          <div className="base-map-card__opacity-label">
            {trans('map.basemap.opacity')}
          </div>
          <MapRangeSlider
            value={opacity ?? 1}
            aria-label={trans('map.basemap.opacity')}
            onChange={setOpacity}
          />
        </div>
      ) : null}
      {allowAddBasemap ? (
        <div
          className="base-map-card__add"
          onClick={(event) => event.stopPropagation()}
        >
          <MapControlButton
            variant="text"
            size="small"
            title={trans('map.basemap.add')}
            aria-label={trans('map.basemap.add')}
            onClick={() => setShowAddForm(true)}
          >
            <Icon path={mdiPlus} size="16px" />
            {trans('map.basemap.add')}
          </MapControlButton>
        </div>
      ) : null}
    </div>
  );
}
