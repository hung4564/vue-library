import { type IDataset, type IListViewUI } from '../../interfaces';
import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';
import { createDatasetMenu } from '../menu';

export function createDatasetPartListViewUiComponentBuilder<
  T extends IDataset = IDataset,
>(name: string) {
  // internal state
  const state: Partial<IListViewUI<T> & { data: T }> = {
    config: {
      disabled_delete: false,
      disabled_opacity: false,
      component: undefined,
      init_show_legend: false,
    },
    index: 0,
  };

  // chainable API
  const builder = {
    setData(data: T) {
      state.data = data;
      return builder;
    },
    setColor(color: IListViewUI<T>['color']) {
      state.color = color;
      return builder;
    },
    setOpacity(opacity: number) {
      state.opacity = opacity;
      return builder;
    },
    setIndex(index: number) {
      state.index = index;
      return builder;
    },
    setGroup(group: IListViewUI<T>['group']) {
      state.group = group;
      return builder;
    },
    setLegend(legend: IListViewUI<T>['legend']) {
      state.legend = legend;
      return builder;
    },
    configDisabledOpacity(disabled?: boolean) {
      if (!state.config) {
        state.config = {};
      }
      state.config.disabled_opacity = disabled == undefined ? true : disabled;
      return builder;
    },
    configDisabledDelete(disabled?: boolean) {
      if (!state.config) {
        state.config = {};
      }
      state.config.disabled_delete = disabled == undefined ? true : disabled;
      return builder;
    },
    configInitShowLegend(initShow?: boolean) {
      if (!state.config) {
        state.config = {};
      }
      state.config.init_show_legend = initShow == undefined ? true : initShow;
      return builder;
    },

    build() {
      const base = createDatasetLeaf<T>(name, state.data);
      const menu = createDatasetMenu();

      const component = {
        ...base,
        ...menu,
        get type(): string {
          return 'list';
        },
        opacity: state.opacity ?? 1,
        selected: state.selected ?? false,
        color: state.color,
        config: {
          disabled_delete: false,
          disabled_opacity: false,
          component: undefined,
          ...state.config,
        },
        index: state.index ?? 0,
        group: state.group,
        show: state.show ?? true,
        shows: state.shows ?? [],
        legend: state.legend,
      };

      return createNamedComponent('ListViewUIComponent', component);
    },
  };

  return builder;
}
