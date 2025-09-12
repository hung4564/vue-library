import type { MapSimple } from '@hungpvq/shared-map';
import {
  createMenuItemSetOpacity,
  createWithEventHelper,
  createWithMenuHelper,
} from '../../extra';
import type { IDataset, WithChildren } from '../../interfaces';
import { setOpacity, toggleShow } from '../../interfaces/dataset.extra';
import { createNamedComponent } from '../base';
import {
  addDatasetWithChildren,
  createDatasetLeaf,
} from '../dataset.base.function';
import type { EventIListViewUI, IListViewUI } from './types';
export interface ListViewUIBuilder {
  state: Partial<IListViewUI>;
  setColor(color: IListViewUI['color']): this;
  setOpacity(opacity: number): this;
  setIndex(index: number): this;
  setGroup(group: IListViewUI['group']): this;
  setLegend(legend: IListViewUI['legend']): this;
  configDisabledOpacity(disabled?: boolean): this;
  configDisabledDelete(disabled?: boolean): this;
  configInitShowLegend(initShow?: boolean): this;
  build(): IListViewUI;
}
interface GroupSubBuilder extends ListViewUIBuilder {
  configInitShowChildren(initShow?: boolean): this;
  build(): IListViewUI & WithChildren;
}

function createBaseListViewUiBuilder<T extends IDataset = IDataset>(
  name: string,
  extra: Partial<IListViewUI> = {},
): ListViewUIBuilder {
  const state: Partial<IListViewUI> = {
    config: {
      disabled_delete: false,
      disabled_opacity: false,
      init_show_legend: false,
    },
    index: 0,
  };

  const builder: ListViewUIBuilder = {
    state,
    setColor(color) {
      state.color = color;
      return this;
    },
    setOpacity(opacity) {
      state.opacity = opacity;
      return this;
    },
    setIndex(index) {
      state.index = index;
      return this;
    },
    setGroup(group) {
      state.group = group;
      return this;
    },
    setLegend(legend) {
      state.legend = legend;
      return this;
    },
    configDisabledOpacity(disabled) {
      state.config!.disabled_opacity = disabled ?? true;
      return this;
    },
    configDisabledDelete(disabled) {
      state.config!.disabled_delete = disabled ?? true;
      return this;
    },
    configInitShowLegend(initShow) {
      state.config!.init_show_legend = initShow ?? true;
      return this;
    },
    build(): IListViewUI {
      const base = createDatasetLeaf(name);
      const menu = createWithMenuHelper();
      const event = createWithEventHelper<EventIListViewUI>();

      const dataset = {
        ...base,
        ...menu,
        ...event,
        get type(): string {
          return 'list';
        },
        opacity: state.opacity ?? 1,
        selected: state.selected ?? false,
        color: state.color,
        index: state.index ?? 0,
        ...extra,
        group: state.group,
        show: state.show ?? true,
        shows: state.shows ?? [],
        legend: state.legend,
        icon: state.icon,
        config: {
          disabled_delete: false,
          disabled_opacity: false,
          ...state.config,
        },
        toggleShow(map: MapSimple, show: boolean) {
          return toggleShow.call(this, map, show);
        },
        setOpacity(map: MapSimple, opacity: number) {
          return setOpacity.call(this, map, opacity);
        },
      };
      if (!state.icon) {
        dataset.icon = { componentKey: 'layer-icon' };
      }
      if (!dataset.config.disabled_opacity) {
        dataset.addMenu(createMenuItemSetOpacity());
      }
      return dataset;
    },
  };

  return builder;
}

function proxify<B extends object, E extends object>(
  base: B,
  extended: E,
): B & E {
  const target = { ...base, ...extended };
  const proxy = new Proxy(target, {
    get(_, prop, receiver) {
      const value = (target as any)[prop];
      if (typeof value === 'function') {
        return (...args: any[]) => {
          const result = value.apply(receiver, args);
          return result === target || result === base || result === extended
            ? receiver
            : result;
        };
      }
      return value;
    },
  });
  return proxy as B & E;
}

export function createDatasetPartListViewUiComponentBuilder(
  name: string,
): ListViewUIBuilder {
  const base = createBaseListViewUiBuilder(name);
  const originBuild = base.build.bind(base);

  const extended = {
    build(this: ListViewUIBuilder) {
      const origin = originBuild();
      return createNamedComponent('ListViewUIComponent', origin);
    },
  };

  const proxy = proxify(base, extended);
  (proxy as any).state = base.state;
  return proxy;
}

export function createDatasetPartGroupSubListViewUiComponentBuilder(
  name: string,
): GroupSubBuilder {
  const base = createBaseListViewUiBuilder(name, {
    config: {
      disabled_delete: false,
      disabled_opacity: false,
      init_show_legend: false,
      init_show_children: false,
    },
  });
  const originBuild = base.build.bind(base);

  const extended = {
    configInitShowChildren(this: GroupSubBuilder, initShow?: boolean) {
      base.state.config!.init_show_children = initShow ?? true;
      return proxy;
    },
    build(this: GroupSubBuilder) {
      const origin = originBuild();
      return createNamedComponent(
        'GroupSubListViewUIComponent',
        addDatasetWithChildren(origin),
      );
    },
  };

  const proxy = proxify(base, extended) as GroupSubBuilder;
  (proxy as any).state = base.state;
  return proxy;
}

export function createDatasetPartSubListViewUiComponentBuilder(
  name: string,
): ListViewUIBuilder {
  const base = createBaseListViewUiBuilder(name, {
    get type(): string {
      return 'list-item';
    },
  });
  base.configDisabledOpacity();
  const originBuild = base.build.bind(base);

  const extended = {
    build(this: ListViewUIBuilder) {
      const origin = originBuild();
      return createNamedComponent('ListViewUIComponent', origin);
    },
  };

  const proxy = proxify(base, extended);
  (proxy as any).state = base.state;
  return proxy;
}
