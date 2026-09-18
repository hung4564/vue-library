import {
  findAllComponentsByType,
  type IDataset,
} from '@hungpvq/map-dataset';
import type { WithMenuHelper } from '@hungpvq/map-dataset/menu';
import { createMenuItemViewDatasetSource } from './source-snippets';

const VIEW_SOURCE_MENU = createMenuItemViewDatasetSource();

const LIST_TYPES = ['list', 'list-item'] as const;

/**
 * Attach ⋮ View source to every list / list-item under a demo dataset.
 * Safe to call multiple times (menu id is deduped by addMenus).
 */
export function attachViewSourceMenuToLists(dataset: IDataset): IDataset {
  for (const type of LIST_TYPES) {
    const lists = findAllComponentsByType(dataset, type);
    for (const list of lists) {
      const withMenus = list as IDataset & Partial<WithMenuHelper>;
      if (typeof withMenus.addMenus === 'function') {
        withMenus.addMenus([VIEW_SOURCE_MENU]);
      }
    }
  }
  return dataset;
}
