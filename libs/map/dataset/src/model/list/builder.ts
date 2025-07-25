import type { MapSimple } from '@hungpvq/shared-map';
import { createDatasetMenu } from '../../extra/menu';
import type { IDataset, IListViewUI, WithChildren } from '../../interfaces';
import { createNamedComponent } from '../base';
import {
  addDatasetWithChildren,
  createDatasetLeaf,
} from '../dataset.base.function';
/* =========================
 * Types (dùng polymorphic `this`)
 * ========================= */
export interface ListViewUIBuilder<T extends IDataset> {
  state: Partial<IListViewUI<T> & { data: T }>;
  setData(data: T): this;
  setColor(color: IListViewUI<T>['color']): this;
  setOpacity(opacity: number): this;
  setIndex(index: number): this;
  setGroup(group: IListViewUI<T>['group']): this;
  setLegend(legend: IListViewUI<T>['legend']): this;
  configDisabledOpacity(disabled?: boolean): this;
  configDisabledDelete(disabled?: boolean): this;
  configInitShowLegend(initShow?: boolean): this;
  build(): IListViewUI;
}
interface GroupSubBuilder<T extends IDataset> extends ListViewUIBuilder<T> {
  configInitShowChildren(initShow?: boolean): this;
  build(): IListViewUI & WithChildren;
}

/* =========================
 * Base builder
 * ========================= */
function createBaseListViewUiBuilder<T extends IDataset = IDataset>(
  name: string,
  extraConfigKeys: Record<string, any> = {},
): ListViewUIBuilder<T> {
  const state: Partial<IListViewUI<T> & { data: T }> = {
    config: {
      disabled_delete: false,
      disabled_opacity: false,
      component: undefined,
      init_show_legend: false,
      ...extraConfigKeys,
    },
    index: 0,
  };

  const builder: ListViewUIBuilder<T> = {
    state,
    setData(data: T) {
      state.data = data;
      return this;
    },
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
      const base = createDatasetLeaf<T>(name, state.data);
      const menu = createDatasetMenu();

      const dataset = {
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
        toggleShow(map: MapSimple, show: boolean) {
          dataset.show = !!show;
        },
      };

      return dataset;
    },
  };

  return builder;
}

/* =========================
 * proxify: luôn trả về proxy để chain đúng kiểu
 * ========================= */
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
          // nếu method trả về chính target/base/extended thì ép trả về proxy để chain tiếp
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

/* =========================
 * List builder
 * ========================= */
export function createDatasetPartListViewUiComponentBuilder<
  T extends IDataset = IDataset,
>(name: string): ListViewUIBuilder<T> {
  const base = createBaseListViewUiBuilder<T>(name);
  const originBuild = base.build.bind(base);

  const extended = {
    build(this: ListViewUIBuilder<T>) {
      const origin = originBuild();
      return createNamedComponent('ListViewUIComponent', origin);
    },
  };

  const proxy = proxify(base, extended);
  (proxy as any).state = base.state;
  return proxy;
}

/* =========================
 * Group-sub builder
 * ========================= */
export function createDatasetPartGroupSubListViewUiComponentBuilder<
  T extends IDataset = IDataset,
>(name: string): GroupSubBuilder<T> {
  const base = createBaseListViewUiBuilder<T>(name, {
    init_show_children: false,
  });
  const originBuild = base.build.bind(base);

  const extended = {
    configInitShowChildren(this: GroupSubBuilder<T>, initShow?: boolean) {
      base.state.config!.init_show_children = initShow ?? true;
      return proxy;
    },
    build(this: GroupSubBuilder<T>) {
      const origin = originBuild();
      return createNamedComponent(
        'GroupSubListViewUIComponent',
        addDatasetWithChildren(origin),
      );
    },
  };

  const proxy = proxify(base, extended) as GroupSubBuilder<T>;
  (proxy as any).state = base.state;
  return proxy;
}
