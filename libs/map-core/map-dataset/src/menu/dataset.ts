import type {
  DatasetMenuEntry,
  DatasetMenuFor,
  IDataset,
  IMenuView,
  MenuAction,
  WithMenuHelper,
} from '../interfaces';
import { findFirstLeafByType } from '../model/visitors';

function menuActionFromEntry(entry: DatasetMenuEntry): MenuAction {
  const id = entry.menu.id ?? entry.key;
  return id ? { ...entry.menu, id } : { ...entry.menu };
}

function getLocalMenus(dataset: IDataset | undefined): MenuAction[] {
  if (!dataset) return [];
  const helper = dataset as IDataset & Partial<WithMenuHelper>;
  if (typeof helper.getMenus !== 'function') return [];
  return helper.getMenus() ?? [];
}

/** Nearest `menu` part from `dataset` (same tree). */
function getMenuDataset(dataset: IDataset): IMenuView | undefined {
  return findFirstLeafByType<IMenuView>(dataset, 'menu');
}

/** Nearest `identify` part from `dataset`, or `dataset` when none exists. */
export function getItemMenuHost(dataset: IDataset): IDataset {
  return findFirstLeafByType(dataset, 'identify') ?? dataset;
}

function mergeMenuActions(
  defaults: MenuAction[],
  locals: MenuAction[],
): MenuAction[] {
  const result = [...defaults];
  for (const local of locals) {
    const id = local.id;
    if (id) {
      const index = result.findIndex((menu) => menu.id === id);
      if (index !== -1) {
        result[index] = local;
        continue;
      }
    }
    result.push(local);
  }
  return result;
}

/** Default menus from the nearest `menu` part (`findFirstLeafByType`). */
function resolveDatasetDefaultMenus(
  dataset: IDataset,
  target: DatasetMenuFor,
): MenuAction[] {
  const part = getMenuDataset(dataset);
  const entries = part?.getData?.();
  if (!Array.isArray(entries)) return [];

  const byKey = new Map<string, MenuAction>();
  let anon = 0;
  for (const entry of entries) {
    if (!entry || entry.for !== target) continue;
    const menu = menuActionFromEntry(entry);
    const key = entry.key || menu.id || `__anon_${anon++}`;
    byKey.set(key, menu);
  }
  return [...byKey.values()];
}

/**
 * `layer` — list / list-item: defaults (`for: 'layer'`) + that node's menus.
 * `item` — identify / table: defaults (`for: 'item'`) + identify menus.
 */
export function getResolvedMenus(
  dataset: IDataset,
  target: DatasetMenuFor,
): MenuAction[] {
  const defaults = resolveDatasetDefaultMenus(dataset, target);
  const localHost = target === 'item' ? getItemMenuHost(dataset) : dataset;
  return mergeMenuActions(defaults, getLocalMenus(localHost));
}
