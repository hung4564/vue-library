import type { MenuAction } from '../../interfaces/dataset.parts';
import type { IDataset } from '../../interfaces/dataset.base';
import type { IListViewUI } from '../../model/list/types';
import { findAllComponentsByType } from '../../model/visitors/helpers';
import { getResolvedMenus } from '../../menu/dataset';
import {
  getMenuItemLocation,
  mergeMenusById,
} from '../../menu/location';

export type LayerControlTitleMenuState = {
  menus: MenuAction[];
  data: IDataset | undefined;
};

/**
 * Aggregate layer-control panel title menus across dataset roots (Vue/React parity).
 */
export function getLayerControlTitleMenuState(
  roots: IDataset[],
): LayerControlTitleMenuState {
  const lists: MenuAction[][] = [];
  let firstData: IDataset | undefined = roots[0];
  for (const root of roots) {
    const listViews = findAllComponentsByType<IListViewUI>(root, 'list');
    for (const list of listViews) {
      if (!firstData) firstData = list;
      lists.push(
        getResolvedMenus(list, 'layer').filter(
          (menu) => getMenuItemLocation(menu) === 'title',
        ),
      );
    }
  }
  return {
    menus: mergeMenusById(lists),
    data: firstData,
  };
}
