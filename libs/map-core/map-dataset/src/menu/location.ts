import type { MenuAction, MenuActionLocation } from '../interfaces';
import type { MenuConditionContext } from './types';
import { isMenuItemHidden } from './condition';
import { applyMenuControlPlacement } from './placement';

/** Location on a menu item, if present. */
export function getMenuItemLocation(
  item: MenuAction,
): MenuActionLocation | undefined {
  return item.type === 'item' && 'location' in item ? item.location : undefined;
}

/** Resolve location from host prop or menu item (default `extra`). */
export function resolveMenuItemLocation(
  item: MenuAction,
  location?: MenuActionLocation,
): MenuActionLocation {
  return location ?? getMenuItemLocation(item) ?? 'extra';
}

export type PartitionedMenuActions = {
  extra: MenuAction[];
  menu: MenuAction[];
  bottom: MenuAction[];
  prebottom: MenuAction[];
  title: MenuAction[];
};

function sortByOrder(a: MenuAction, b: MenuAction) {
  return (a.order || 0) - (b.order || 0);
}

function bucketFor(item: MenuAction): keyof PartitionedMenuActions {
  const loc = getMenuItemLocation(item);
  if (loc === 'menu') return 'menu';
  if (loc === 'bottom') return 'bottom';
  if (loc === 'prebottom') return 'prebottom';
  if (loc === 'title') return 'title';
  return 'extra';
}

/**
 * Split menus by `location` (unset → `extra`), apply `byControl` placement,
 * filter hidden, sort by `order`.
 */
export function partitionMenuActions(
  menus: MenuAction[],
  ctx?: MenuConditionContext,
): PartitionedMenuActions {
  const out: PartitionedMenuActions = {
    extra: [],
    menu: [],
    bottom: [],
    prebottom: [],
    title: [],
  };
  for (const item of menus) {
    const resolved = applyMenuControlPlacement(item, ctx);
    if (ctx && isMenuItemHidden(resolved, ctx)) continue;
    out[bucketFor(resolved)].push(resolved);
  }
  out.extra.sort(sortByOrder);
  out.menu.sort(sortByOrder);
  out.bottom.sort(sortByOrder);
  out.prebottom.sort(sortByOrder);
  out.title.sort(sortByOrder);
  return out;
}

/** Merge menu lists by `id` (first wins). Items without id are always appended. */
export function mergeMenusById(lists: MenuAction[][]): MenuAction[] {
  const result: MenuAction[] = [];
  const seen = new Set<string>();
  for (const list of lists) {
    for (const menu of list) {
      const id = menu.id;
      if (id) {
        if (seen.has(id)) continue;
        seen.add(id);
      }
      result.push(menu);
    }
  }
  return result;
}
