/**
 * React hook to make store reactive
 * Forces re-render when store changes
 */

import { useState, useEffect, useCallback } from 'react';
import { GlobalStoreService } from '@hungpvq/shared-store';
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

  useEffect(() => {
    // Subscribe to changes in the drag:core store
    const unsubscribe = GlobalStoreService.getInstance().subscribe(
      'drag:core',
      forceUpdate,
    );
    return unsubscribe;
  }, [forceUpdate]);

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

  useEffect(() => {
    // Subscribe to changes in the specific container
    const unsubscribe = GlobalStoreService.getInstance().subscribe(
      ['drag:core', 'container', containerId],
      forceUpdate,
    );
    return unsubscribe;
  }, [containerId, forceUpdate]);

  return store;
}
