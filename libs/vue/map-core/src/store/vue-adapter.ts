/**
 * Vue-specific store adapter
 * Implements IMapStoreAdapter for Vue framework
 */

import { logHelper } from '@hungpvq/map-core';
import type { Emitter, EventType } from 'mitt';
import type {
  IMapStoreAdapter,
  LoggerFunction,
  MapRootStore,
} from '@hungpvq/map-core';
import { useMapMittStore } from '../extra/mitt';
import { useMapGLobalStore } from './global-store';
import { logger } from './logger';

/**
 * Vue store adapter
 * Provides Vue-specific implementations for store operations
 */
export class VueMapStoreAdapter implements IMapStoreAdapter {
  /**
   * Get root store instance (Vue store)
   */
  getRootStore(): MapRootStore {
    return useMapGLobalStore();
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
    const loggerInstance = logHelper(logger, mapId, 'store');
    loggerInstance[level](message, data);
  };
}
