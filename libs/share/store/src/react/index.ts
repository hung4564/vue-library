/**
 * React-specific utilities for @hungpvq/shared-store
 * Provides hooks and utilities to use the store with React
 */

import { useEffect, useState, useCallback } from 'react';
import { GlobalStoreService } from '../store';

/**
 * React hook to use a store value with automatic re-renders on changes
 */
export function useStoreValue<T>(
  path: string | string[],
  defaultValue?: T,
): [T | undefined, (value: T) => void] {
  const store = GlobalStoreService.getInstance();
  const [value, setValue] = useState<T | undefined>(() => {
    const current = store.get<T>(path);
    return current !== undefined ? current : defaultValue;
  });

  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = store.subscribe(path, () => {
      const newValue = store.get<T>(path);
      setValue(newValue !== undefined ? newValue : defaultValue);
    });

    // Update value if it changed externally
    const current = store.get<T>(path);
    if (current !== value) {
      setValue(current !== undefined ? current : defaultValue);
    }

    return unsubscribe;
  }, [path, defaultValue]);

  const setStoreValue = useCallback(
    (newValue: T) => {
      store.set(path, newValue);
    },
    [path],
  );

  return [value, setStoreValue];
}

/**
 * React hook to subscribe to store changes
 */
export function useStoreSubscribe(
  path: string | string[],
  callback: () => void,
) {
  const store = GlobalStoreService.getInstance();

  useEffect(() => {
    const unsubscribe = store.subscribe(path, callback);
    return unsubscribe;
  }, [path, callback]);
}

/**
 * React adapter for defineStore
 * Returns a hook that provides reactive access to the store
 */
export function defineStoreReact<T>(
  id: string | string[],
  setup: () => T,
): () => T {
  const store = GlobalStoreService.getInstance();

  if (!store.has(id)) {
    const storeValue = setup();
    store.set(id, storeValue);
  }

  return function useStore(): T {
    const [storeValue, setStoreValue] = useState<T>(() => {
      return store.get<T>(id) as T;
    });

    useEffect(() => {
      const unsubscribe = store.subscribe(id, () => {
        const newValue = store.get<T>(id);
        if (newValue !== undefined) {
          setStoreValue(newValue);
        }
      });

      return unsubscribe;
    }, []);

    return storeValue;
  };
}
