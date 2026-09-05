import type { MenuContextSource } from '@hungpvq/map-dataset';
import { resolveMenuContextSource } from '@hungpvq/map-dataset';
import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

const MenuConditionContext = createContext<MenuContextSource>(undefined);

export function MenuConditionProvider({
  value,
  children,
}: {
  value?: MenuContextSource;
  children: ReactNode;
}) {
  const parent = useContext(MenuConditionContext);
  const merged: MenuContextSource = () => ({
    ...resolveMenuContextSource(parent),
    ...resolveMenuContextSource(value),
  });
  return (
    <MenuConditionContext.Provider value={merged}>
      {children}
    </MenuConditionContext.Provider>
  );
}

export function useMenuConditionContext(): Record<string, any> {
  return resolveMenuContextSource(useContext(MenuConditionContext));
}
