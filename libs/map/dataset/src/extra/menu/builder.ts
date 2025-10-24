import type { Feature } from 'geojson';
import type { IDataset, MenuAction } from '../../interfaces';

import type {
  CommandHandlerMenuExecute,
  MenuItemClick,
  MenuItemClickCommon,
  MenuItemClickHandle,
  MenuItemHandle,
  MenuItemProps,
  WithMenuBuilder,
} from './types';

export function addMenuBuilder<
  TBuilder extends { build: (...args: any[]) => any },
>(builder: TBuilder): WithMenuBuilder & TBuilder {
  const _menus: MenuAction<IDataset>[] = [];

  // lưu build gốc ra trước
  const originalBuild = builder.build;

  return Object.assign(builder, {
    addMenu(menu: MenuAction<IDataset>) {
      _menus.push(menu);
      return this;
    },
    addMenus(menus: MenuAction<IDataset>[]) {
      _menus.push(...menus);
      return this;
    },
    build(this: TBuilder, ...args: any[]) {
      const dataset = originalBuild.apply(this, args);
      if (_menus.length && typeof dataset.addMenus === 'function') {
        dataset.addMenus(_menus);
      }
      return dataset;
    },
  });
}
export function createMenuBuilder<T = IDataset>() {
  return {
    divider() {
      const state: any = { type: 'divider' as const };

      return {
        setLocation(loc: 'extra' | 'menu' | 'bottom' | 'prebottom') {
          state.location = loc;
          return this;
        },
        build() {
          return state; // type MenuDivider
        },
      };
    },

    item() {
      const state: any = { type: 'item' as const };

      return {
        setId(id: string) {
          state.id = id;
          return this;
        },
        setLocation(loc: 'menu' | 'bottom' | 'extra' | 'prebottom') {
          state.location = loc;
          return this;
        },
        setName(name: string) {
          state.name = name;
          return this;
        },
        setIcon(icon: string) {
          state.icon = icon;
          return this;
        },
        setComponentKey(key: string) {
          state.componentKey = key;
          return this;
        },
        setAdditional(additional: Partial<any>) {
          Object.assign(state, additional);
          return this;
        },
        setClick(
          click:
            | MenuItemClick<T>
            | ReturnType<typeof createMenuClickBuilder<T>>,
        ) {
          // nếu truyền vào builder thì gọi build()
          state.click =
            typeof (click as any).build === 'function'
              ? (click as ReturnType<typeof createMenuClickBuilder<T>>).build()
              : click;
          return this;
        },
        build() {
          return state; // sẽ infer ra MenuItemBottomOrExtra | MenuItemContentMenu | MenuItemCustomComponentBottomOrExtra
        },
      };
    },
  };
}

export function createMenuClickBuilder<P = any, T = any>() {
  const actions: any[] = [];

  return {
    // case 1: string
    addCommand(cmd: MenuItemClickCommon<P, T> | MenuItemClickHandle<P, T>) {
      actions.push(cmd);
      return this;
    },

    // case 2: string[]
    addCommands(
      cmds: (MenuItemClickCommon<P, T> | MenuItemClickHandle<P, T>)[],
    ) {
      actions.push(cmds);
      return this;
    },

    // case 3: tuple dạng { layer: T, mapId: string, value?: any }
    addTupleStatic(
      key: MenuItemClickCommon<P, T>,
      tuple: Partial<MenuItemProps>,
    ) {
      actions.push([key, tuple]);
      return this;
    },

    // case 4: tuple dạng [key, MenuItemHandle<T>]
    addTupleDynamic(key: MenuItemClickCommon<P, T>, fn: MenuItemHandle<P, T>) {
      actions.push([key, fn]);
      return this;
    },

    // build: nếu chỉ có 1 action thì return nó, còn lại thì array
    build<P, T>(): MenuItemClick<P, T> {
      if (
        actions.length === 1 &&
        (typeof actions[0] === 'string' || typeof actions[0] === 'function')
      ) {
        return actions[0] as MenuItemClick<P, T>;
      }
      return actions as MenuItemClick<P, T>;
    },
  };
}
export function createMenuProps<P, T>(
  base: Partial<MenuItemProps<P, T>>,
  extra?: Partial<MenuItemProps<P, T>>,
): MenuItemProps<P, T> {
  return {
    mapId: base.mapId!,
    layer: base.layer!,
    value: extra?.value ?? base.value,
    meta: { ...base.meta, ...extra?.meta },
    context: { ...base.context, ...extra?.context },
  };
}
export interface MenuClickAddComponent {
  componentKey: string;
  attr?: Record<string, any>;
  check?: string;
}

export function createMenuClickAddComponentBuilder(
  initial?: Partial<MenuClickAddComponent>,
) {
  const config: Partial<MenuClickAddComponent> = { ...initial };

  const builder = {
    setComponentKey(key: string) {
      config.componentKey = key;
      return builder;
    },
    setAttr(attr: Record<string, any>) {
      config.attr = attr;
      return builder;
    },
    setCheck(check: string) {
      config.check = check;
      return builder;
    },
    build(): MenuClickAddComponent {
      const { componentKey, attr, check } = config;
      if (!componentKey) throw new Error('componentKey is required');
      return { componentKey, attr, check };
    },
  };

  return builder;
}
export interface MenuClickHighlight {
  detail: Feature;
  key: string;
}

export function createMenuClickHighlightBuilder(
  initial?: Partial<MenuClickHighlight>,
) {
  const config: Partial<MenuClickHighlight> = { ...initial };

  const builder = {
    /** Thiết lập giá trị cho detail */
    setDetail(detail: Feature) {
      config.detail = detail;
      return builder;
    },

    /** Thiết lập giá trị cho key */
    setKey(key: string) {
      config.key = key;
      return builder;
    },

    /** Trả về object cuối cùng */
    build(): MenuClickHighlight {
      const { detail, key } = config;
      if (!key) throw new Error('key is required');
      if (detail === undefined) throw new Error('detail is required');
      return { detail, key };
    },
  };

  return builder;
}

export interface MenuClickFitBounds {
  detail: Feature;
}

export function createMenuClickFitBoundsBuilder(
  initial?: Partial<MenuClickFitBounds>,
) {
  const config: Partial<MenuClickFitBounds> = { ...initial };

  const builder = {
    /** Thiết lập giá trị cho detail */
    setDetail(detail: Feature) {
      config.detail = detail;
      return builder;
    },

    /** Trả về object cuối cùng */
    build(): MenuClickFitBounds {
      const { detail } = config;
      if (detail === undefined) throw new Error('detail is required');
      return { detail };
    },
  };

  return builder;
}
