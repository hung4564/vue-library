import type { MapSimple } from '@hungpvq/map-core';
import type { IDataset, IMapboxLayerView, WithToggleShow } from '../../interfaces';
import type { IListViewUI } from '../../model/list';
import { runAllComponentsWithCheck } from '../../model/visitors';
import { isHasToggleShow, isMapboxLayerView } from '../../utils/check';

export function applyListViewMapVisibility(
  item: IListViewUI,
  map: MapSimple,
  show: boolean,
) {
  const parent = item.getParent() || item;
  runAllComponentsWithCheck(
    parent,
    (dataset): dataset is IDataset & IMapboxLayerView =>
      isMapboxLayerView(dataset),
    [(dataset) => dataset.toggleShow(map, show)],
  );
}

/**
 * Update intended list `show`. Map visibility is applied only when `applyToMap`.
 */
export function setListViewIntendedShow(
  item: IListViewUI,
  map: MapSimple,
  show: boolean,
  applyToMap: boolean,
) {
  const parent = item.getParent() || item;
  runAllComponentsWithCheck(
    parent,
    (dataset): dataset is IDataset & WithToggleShow => isHasToggleShow(dataset),
    [
      (dataset) => {
        if (isMapboxLayerView(dataset)) {
          if (applyToMap) dataset.toggleShow(map, show);
          return;
        }
        dataset.toggleShow(map, show);
      },
    ],
  );
}

/** Global off hides on the map only; list `show` is restored when global turns on. */
export function applyGlobalLayerVisibility(
  items: IListViewUI[],
  map: MapSimple,
  globalShow: boolean,
) {
  items.forEach((item) => {
    applyListViewMapVisibility(item, map, globalShow ? !!item.show : false);
  });
}
