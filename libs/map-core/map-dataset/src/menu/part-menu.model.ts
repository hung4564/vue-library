import { createWithDataHelper } from '../extra';
import type { DatasetMenuEntry, IMenuView } from '../interfaces/dataset.parts';
import { createNamedComponent } from '../model/base';
import { createDatasetLeaf } from '../model/dataset.base.function';

function normalizeMenuEntries(menus: DatasetMenuEntry[]): DatasetMenuEntry[] {
  return menus.map((entry) => {
    const key = entry.key || entry.menu.id || '';
    const id = entry.menu.id ?? key;
    return {
      ...entry,
      key,
      menu: id ? { ...entry.menu, id } : { ...entry.menu },
    };
  });
}

export function createDatasetPartMenuComponent(
  name: string,
  menus: DatasetMenuEntry[] = [],
): IMenuView {
  const base = createDatasetLeaf(name);
  const dataHelper = createWithDataHelper<DatasetMenuEntry[]>(
    normalizeMenuEntries(menus),
  );
  return createNamedComponent('MenuComponent', {
    ...base,
    ...dataHelper,
    get type() {
      return 'menu' as const;
    },
  });
}
