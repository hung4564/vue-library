import type { IDataset } from '../../interfaces';
import type { MenuAction } from '../../interfaces';
import type {
  MenuCondition,
  MenuConditionContext,
  MenuContextSource,
} from './types';

export function resolveMenuContextSource(
  source: MenuContextSource,
): Record<string, any> {
  let current: MenuContextSource = source;
  while (typeof current === 'function') {
    current = current();
  }
  return current ?? {};
}

export function createMenuConditionContext<T = IDataset>(
  layer: T,
  options?: {
    mapId?: string;
    context?: MenuContextSource[];
  },
): MenuConditionContext<T> {
  return {
    layer,
    mapId: options?.mapId,
    get context() {
      const merged: Record<string, any> = {};
      for (const source of options?.context ?? []) {
        Object.assign(merged, resolveMenuContextSource(source));
      }
      return merged;
    },
  };
}

export function resolveMenuCondition(
  condition: MenuCondition<any> | undefined,
  ctx: MenuConditionContext<any>,
): boolean {
  if (condition == null) return false;
  if (typeof condition === 'function') return !!condition(ctx);
  return !!condition;
}

export function isMenuItemHidden(
  menu: MenuAction,
  ctx: MenuConditionContext<any>,
): boolean {
  return resolveMenuCondition(menu.hidden, ctx);
}

export function isMenuItemDisabled(
  menu: MenuAction,
  ctx: MenuConditionContext<any>,
): boolean {
  return resolveMenuCondition(menu.disabled, ctx);
}
