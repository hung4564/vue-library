import type {
  IDataset,
  MenuAction,
  MenuItemClick,
  MenuItemHandle,
} from '../../interfaces';

export interface WithMenuBuilder<T = IDataset> {
  addMenu(menu: MenuAction<T>): this;
  addMenus(menusToAdd: MenuAction<T>[]): this;
}

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

export function createMenuClickBuilder<T = IDataset>() {
  const actions: any[] = [];

  return {
    // case 1: string
    addCommand(cmd: string) {
      actions.push(cmd);
      return this;
    },

    // case 2: string[]
    addCommands(cmds: string[]) {
      actions.push(cmds);
      return this;
    },

    // case 3: handler trực tiếp
    addHandler(handler: MenuItemHandle<T>) {
      actions.push(handler);
      return this;
    },

    // case 4: tuple dạng [key, [T, string, any]]
    addTupleStatic(key: string, tuple: [T, string, any]) {
      actions.push([key, tuple]);
      return this;
    },

    // case 5: tuple dạng [key, MenuItemHandle<T>]
    addTupleDynamic(key: string, fn: MenuItemHandle<T>) {
      actions.push([key, fn]);
      return this;
    },

    // build: nếu chỉ có 1 action thì return nó, còn lại thì array
    build(): MenuItemClick<T> {
      if (
        actions.length === 1 &&
        (typeof actions[0] === 'string' || typeof actions[0] === 'function')
      ) {
        return actions[0] as MenuItemClick<T>;
      }
      return actions as MenuItemClick<T>;
    },
  };
}
