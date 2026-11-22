/**
 * Vue-specific store adapter
 * Implements IMapStoreAdapter for Vue framework
 */

import type {
  IMapStoreAdapter,
  LoggerFunction,
  MapRootStore,
} from '@hungpvq/map-core';
import { getMapCoreRootStore, logHelper } from '@hungpvq/map-core';
import type { Emitter, EventType } from 'mitt';

import { logger } from './logger';
import { useMapMittStore } from './mitt-store';

/**
 * Vue store adapter
 * Provides Vue-specific implementations for store operations
 */
export class VueMapStoreAdapter implements IMapStoreAdapter {
  /**
   * Get root store instance (shared `map:core` bag)
   */
  getRootStore(): MapRootStore {
    return getMapCoreRootStore();
  }

  /**
   * Get event emitter for a specific map ID (using mitt)
   */
  getEventEmitter<
    T extends Record<EventType, unknown> = Record<EventType, unknown>,
  >(mapId: string): Emitter<T> {
    return useMapMittStore<T>(mapId);
  }

  /**
   * Log message using Vue-specific logger (logHelper)
   */
  log: LoggerFunction = (
    mapId: string,
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any,
  ) => {
    logHelper(logger, mapId, 'store')
      .with({
        fn: 'log',
        span: 'store.update',
      })
      [level](message, data);
  };
}
