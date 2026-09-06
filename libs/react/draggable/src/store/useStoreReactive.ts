/**
 * React hook to make store reactive
 * Forces re-render when store changes
 */

import { useState, useCallback } from 'react';
import { useStoreSubscribe } from '@hungpvq/shared-store/react';
import { useDragStore } from './index';

/**
 * Hook to force re-render when store changes
 * Use this in components that need to react to store changes
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
 * Hook to subscribe to specific container changes
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
