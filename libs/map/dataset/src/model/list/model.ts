import type { MapSimple } from '@hungpvq/shared-map';
import type { WithChildren } from '../../interfaces';
import type { IListViewUI } from '../../interfaces/dataset.parts';
import { createNamedComponent } from '../base';
import {
  addDatasetWithChildren,
  createDatasetLeaf,
} from '../dataset.base.function';
import { createDatasetMenu } from '../menu';
export function createDatasetPartListViewUiComponent<T = any>(
  name: string,
  data?: T,
): IListViewUI<any> {
  const base = createDatasetLeaf<T>(name, data);
  const menu = createDatasetMenu();

  const dataset = createNamedComponent('ListViewUIComponent', {
    ...base,
    ...menu,
    get type(): string {
      return 'list';
    },

    opacity: 1,
    selected: false,
    color: undefined,

    config: {
      disabled_delete: false,
      disabled_opacity: false,
      component: undefined,
    },

    index: 0,
    group: undefined,
    show: true,
    shows: [],
    legend: undefined,
    toggleShow() {
      dataset.show = !dataset.show;
    },
  });
  return dataset;
}

export function createDatasetPartGroupSubListViewUiComponent<T = any>(
  name: string,
  data?: T,
): IListViewUI<any> & WithChildren {
  const base = createDatasetLeaf<T>(name, data);
  const menu = createDatasetMenu();

  const dataset = createNamedComponent('GroupSubListViewUIComponent', {
    ...base,
    ...menu,
    get type(): string {
      return 'list';
    },

    opacity: 1,
    color: undefined,
    config: {},
    index: 0,
    show: true,
    shows: [],
    toggleShow(map: MapSimple, show?: boolean) {
      dataset.show = !!show;
    },
  });
  return addDatasetWithChildren(dataset);
}

export function createDatasetPartSubListViewUiComponent<T = any>(
  name: string,
  data?: T,
): IListViewUI<any> {
  const base = createDatasetLeaf<T>(name, data);
  const menu = createDatasetMenu();

  const dataset = createNamedComponent('SubListViewUIComponent', {
    ...base,
    ...menu,
    get type(): string {
      return 'list-item';
    },

    opacity: 1,
    color: undefined,

    config: {
      component: undefined,
    },

    index: 0,
    show: true,
    shows: [],
    toggleShow(map: MapSimple, show?: boolean) {
      dataset.show = !!show;
    },
  });
  return dataset;
}
