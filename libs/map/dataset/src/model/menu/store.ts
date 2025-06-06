import { GlobalStoreService } from '@hungpvq/shared-store';
import type { MenuItemHandle } from '../../interfaces';

const handlerMap = GlobalStoreService.getInstance();
export const KEY = 'dataset-action';
export function registerMenuHandler<TContext = any>(
  key: string,
  fn: MenuItemHandle<TContext>,
) {
  handlerMap.set([KEY, key], fn);
}

export function getMenuHandler<TContext = any>(
  key: string,
): MenuItemHandle<TContext> | undefined {
  return handlerMap.get([KEY, key]);
}
