import type { MapSimple } from '@hungpvq/map-core';
import type { IDataset } from '../../interfaces/dataset.base';
import type { WithToggleShow } from '../../interfaces/dataset.extra';
import type { IMapboxLayerView } from '../../interfaces/dataset.parts';
import type { IListViewUI } from '../../model/list/types';
import { runAllComponentsWithCheck } from '../../model/visitors/helpers';
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

/** How the LayerControl header “show all” eye applies visibility. */
export type GlobalVisibilityMode = 'override' | 'sync';

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

/** Set every list item’s intended `show` (emit) and apply on the map. */
export function syncAllLayerIntendedShow(
  items: IListViewUI[],
  map: MapSimple,
  show: boolean,
) {
  items.forEach((item) => {
    // 1) List intended state + emit (ToggleShow / bindToggleShowAction)
    item.toggleShow(map, show);
    // 2) Map layout for mapbox descendants
    applyListViewMapVisibility(item, map, show);
  });
}

/** Dispatch header eye: `override` (map mask) vs `sync` (intended show). */
export function applyAllLayerVisibility(
  items: IListViewUI[],
  map: MapSimple,
  show: boolean,
  mode: GlobalVisibilityMode = 'override',
) {
  if (mode === 'sync') {
    syncAllLayerIntendedShow(items, map, show);
    return;
  }
  applyGlobalLayerVisibility(items, map, show);
}
