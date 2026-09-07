/**
 * React hooks to make the drag store reactive.
 * Import `useDragStore` from core (not `./index`) to avoid a circular barrel
 * with `store/index.ts` — that cycle broke Vite ESM named re-exports
 * (`DraggableContainer is not exported`).
 */

import { useDragStore } from '@hungpvq/draggable';
import { useStoreSubscribe } from '@hungpvq/shared-store/react';
import { useCallback, useState } from 'react';

/**
 * Hook to force re-render when store changes.
 * Root `@hungpvq/react-draggable` entry runs `configureDragStore` via `./store`.
 */
export function useStoreReactive() {
  const [, setTick] = useState(0);
  const store = useDragStore();

  const forceUpdate = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useStoreSubscribe('drag:core', forceUpdate);

  return store;
}

/**
 * Hook to subscribe to specific container changes.
 */
export function useContainerReactive(containerId: string) {
  const [, setTick] = useState(0);
  const store = useDragStore();

  const forceUpdate = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useStoreSubscribe(['drag:core', 'container', containerId], forceUpdate);

  return store;
}
