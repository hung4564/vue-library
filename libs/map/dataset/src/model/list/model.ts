import type { IListViewUI } from '../../interfaces/dataset.parts';
import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';
import { createDatasetMenu } from '../menu';
export function createDatasetPartListViewUiComponent<T = any>(
  name: string,
  data?: T,
): IListViewUI<any> {
  const base = createDatasetLeaf<T>(name, data);
  const menu = createDatasetMenu();

  return createNamedComponent('ListViewUIComponent', {
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
  });
}
