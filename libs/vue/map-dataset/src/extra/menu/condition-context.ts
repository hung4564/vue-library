import type { MenuContextSource } from '@hungpvq/map-dataset';
import { resolveMenuContextSource } from '@hungpvq/map-dataset';
import { inject, provide, type InjectionKey } from 'vue';

export const MENU_CONDITION_CONTEXT_KEY: InjectionKey<MenuContextSource> =
  Symbol('map-dataset-menu-condition-context');

export function provideMenuConditionContext(source: MenuContextSource) {
  const parent = inject(MENU_CONDITION_CONTEXT_KEY, undefined);
  provide(MENU_CONDITION_CONTEXT_KEY, () => ({
    ...resolveMenuContextSource(parent),
    ...resolveMenuContextSource(source),
  }));
}

export function useMenuConditionSource(): MenuContextSource {
  return inject(MENU_CONDITION_CONTEXT_KEY, undefined);
}

export function useMenuConditionContext(): Record<string, any> {
  return resolveMenuContextSource(useMenuConditionSource());
}
