/**
 * React-specific store adapter
 * Implements IMapStoreAdapter for React framework
 */

import type {
  IMapStoreAdapter,
  LoggerFunction,
  MapRootStore,
} from '@hungpvq/map-core';
import { logHelper } from '@hungpvq/map-core';
import type { Emitter, EventType } from 'mitt';
import { getMapGlobalStore } from './global-store';
import { logger } from './logger';
import { useMapMittStore } from './mitt-store';

/**
 * React store adapter
 * Provides React-specific implementations for store operations
 */
export class ReactMapStoreAdapter implements IMapStoreAdapter {
  /**
   * Get root store instance (React store)
   */
  getRootStore(): MapRootStore {
    return getMapGlobalStore();
  }

  /**
   * Get event emitter for a specific map ID (using mitt)
   */
  getEventEmitter<
    T extends Record<EventType, unknown> = Record<EventType, unknown>,
  >(mapId: string): Emitter<T> {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMapMittStore<T>(mapId);
  }

  /**
   * Log message using React-specific logger (logHelper)
   */
  log: LoggerFunction = (
    mapId: string,
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: unknown,
  ) => {
    const loggerInstance = logHelper(logger, mapId, 'store');
    loggerInstance[level](message, data);
  };
}
