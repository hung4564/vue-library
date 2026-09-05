import type { MapSimple } from '@hungpvq/map-core';
import type { IDataset, IListViewUI, IMapboxLayerView } from '@hungpvq/map-dataset';
import {
  isMapboxLayerView,
  runAllComponentsWithCheck,
} from '@hungpvq/map-dataset';
import { BaseButton, getIsMulti, getMaps, useMap } from '@hungpvq/react-map-core';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useState } from 'react';

export function ButtonToggleShowAll({
  mapId,
  items,
}: {
  mapId: string;
  items: IListViewUI[];
}) {
  const { callMap } = useMap({ mapId });
  const [allLayerShow, setAllLayerShow] = useState(true);
  const [allLayerMultiShow, setAllLayerMultiShow] = useState([true, true]);
  const [isMulti, setIsMulti] = useState(false);

  useEffect(() => {
    setIsMulti(getIsMulti(mapId));
  }, [mapId]);

  function onToggleShow(value: boolean) {
    setAllLayerShow(value);
    callMap((map: MapSimple) => {
      items.forEach((item) => {
        item.show = value;
        runAllComponentsWithCheck(
          item.getParent() as IDataset,
          (dataset): dataset is IDataset & IMapboxLayerView => isMapboxLayerView(dataset),
          [(dataset) => dataset.toggleShow(map, value)],
        );
      });
    });
  }

  function onToggleShowIndex(index: number, show: boolean) {
    setAllLayerMultiShow((prev) => {
      const next = [...prev];
      next[index] = show;
      return next;
    });
    const maps = getMaps(mapId);
    const map = maps[index];
    items.forEach((item) => {
      if (item.shows == null) {
        item.shows = [true, true];
      }
      item.shows[index] = show;
      runAllComponentsWithCheck(
        item.getParent() as IDataset,
        (dataset): dataset is IDataset & IMapboxLayerView => isMapboxLayerView(dataset),
        [(dataset) => dataset.toggleShow(map, show)],
      );
    });
  }

  if (isMulti) {
    return (
      <div className="toggle-buttons-container">
        <BaseButton
          className={allLayerMultiShow[0] ? '_active' : undefined}
          onClick={() => onToggleShowIndex(0, !allLayerMultiShow[0])}
        >
          <span>#1</span>
        </BaseButton>
        <BaseButton
          className={allLayerMultiShow[1] ? '_active' : undefined}
          onClick={() => onToggleShowIndex(1, !allLayerMultiShow[1])}
        >
          <span>#2</span>
        </BaseButton>
      </div>
    );
  }

  return (
    <BaseButton
      onClick={() => onToggleShow(!allLayerShow)}
      title={!allLayerShow ? 'Ẩn toàn bộ các lớp' : 'Hiện toàn bộ các lớp'}
    >
      <Icon path={!allLayerShow ? mdiEye : mdiEyeOff} size="14px" />
    </BaseButton>
  );
}
