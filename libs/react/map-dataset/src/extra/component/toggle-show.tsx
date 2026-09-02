import type { MapSimple } from '@hungpvq/map-core';
import type { IDataset, IMapboxLayerView, WithToggleShow } from '@hungpvq/map-dataset';
import {
  isHasToggleShow,
  isMapboxLayerView,
  runAllComponentsWithCheck,
} from '@hungpvq/map-dataset';
import { BaseButton, getIsMulti, getMaps, useMap } from '@hungpvq/react-map-core';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useState } from 'react';
import type { WithLayerItemActionType } from './types';

export function ToggleShow(props: WithLayerItemActionType) {
  const { callMap, mapId } = useMap(props);
  const [showValue, setShowValue] = useState(props.data.show);
  const [isMulti, setIsMulti] = useState(false);

  useEffect(() => {
    setIsMulti(getIsMulti(mapId));
    const onToggle = (e: { show: boolean }) => setShowValue(e.show);
    props.data.on('toggleShow', onToggle);
    return () => props.data.off('toggleShow', onToggle);
  }, [mapId, props.data]);

  function onToggleShow() {
    const show = !showValue;
    callMap((map: MapSimple) => {
      runAllComponentsWithCheck<IDataset & WithToggleShow>(
        props.data.getParent() as IDataset,
        (dataset) => isHasToggleShow(dataset),
        [(dataset) => dataset.toggleShow(map, show)],
      );
    });
  }

  function onToggleShowIndex(index: number) {
    const maps = getMaps(mapId);
    const map = maps[index];
    const item = props.data;
    if (item.shows == null || item.shows.length < 1) {
      const show = item.show == null ? true : item.show;
      item.shows = [show, show];
    }
    item.shows[index] = !item.shows[index];
    setShowValue(item.shows[index]);
    runAllComponentsWithCheck(
      props.data.getParent() as IDataset,
      (dataset): dataset is IDataset & IMapboxLayerView => isMapboxLayerView(dataset),
      [(dataset) => dataset.toggleShow(map, item.shows[index])],
    );
  }

  if (isMulti) {
    const show0 = props.data.shows?.[0] ?? props.data.show ?? true;
    const show1 = props.data.shows?.[1] ?? props.data.show ?? true;
    return (
      <div className="toggle-buttons-container">
        <BaseButton
          className={show0 ? '_active' : ''}
          onClick={() => onToggleShowIndex(0)}
        >
          <span>#1</span>
        </BaseButton>
        <BaseButton
          className={show1 ? '_active' : ''}
          onClick={() => onToggleShowIndex(1)}
        >
          <span>#2</span>
        </BaseButton>
      </div>
    );
  }

  return (
    <BaseButton onClick={onToggleShow}>
      <Icon path={showValue ? mdiEye : mdiEyeOff} size="14px" />
    </BaseButton>
  );
}
