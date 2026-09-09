import type {
  DatasetMenuEntry,
  DatasetMenuFor,
  IMenuView,
  MenuAction,
} from '../interfaces';
import { createDatasetPartMenuComponent } from './part-menu.model';

export interface DatasetMenuBuilder {
  addMenu(entry: DatasetMenuEntry): this;
  addMenus(entries: DatasetMenuEntry[]): this;
  addLayerMenu(menu: MenuAction, key?: string): this;
  addItemMenu(menu: MenuAction, key?: string): this;
  addLayerMenus(menus: MenuAction[]): this;
  addItemMenus(menus: MenuAction[]): this;
  build(): IMenuView;
}

function toEntry(
  target: DatasetMenuFor,
  menu: MenuAction,
  key?: string,
): DatasetMenuEntry {
  return {
    for: target,
    key: key || menu.id || '',
    menu,
  };
}

export function createDatasetPartMenuComponentBuilder(
  name: string,
): DatasetMenuBuilder {
  const entries: DatasetMenuEntry[] = [];

  const builder: DatasetMenuBuilder = {
    addMenu(entry) {
      entries.push(entry);
      return this;
    },
    addMenus(toAdd) {
      entries.push(...toAdd);
      return this;
    },
    addLayerMenu(menu, key) {
      entries.push(toEntry('layer', menu, key));
      return this;
    },
    addItemMenu(menu, key) {
      entries.push(toEntry('item', menu, key));
      return this;
    },
    addLayerMenus(menus) {
      for (const menu of menus) {
        entries.push(toEntry('layer', menu));
      }
      return this;
    },
    addItemMenus(menus) {
      for (const menu of menus) {
        entries.push(toEntry('item', menu));
      }
      return this;
    },
    build() {
      return createDatasetPartMenuComponent(name, entries);
    },
  };

  return builder;
}
