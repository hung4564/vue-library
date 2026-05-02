import type { WithChildren } from '../../interfaces';
import {
  createDatasetPartGroupSubListViewUiComponentBuilder,
  createDatasetPartListViewUiComponentBuilder,
  createDatasetPartSubListViewUiComponentBuilder,
} from './builder';
import type { IListViewUI } from './types';
export function createDatasetPartListViewUiComponent(
  name: string,
): IListViewUI {
  return createDatasetPartListViewUiComponentBuilder(name).build();
}

export function createDatasetPartGroupSubListViewUiComponent(
  name: string,
): IListViewUI & WithChildren {
  return createDatasetPartGroupSubListViewUiComponentBuilder(name).build();
}

export function createDatasetPartSubListViewUiComponent(
  name: string,
): IListViewUI {
  return createDatasetPartSubListViewUiComponentBuilder(name).build();
}
