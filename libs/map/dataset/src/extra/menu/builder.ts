import type { IDataset, MenuAction } from '../../interfaces';

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
