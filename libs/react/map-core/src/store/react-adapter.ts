/**
 * React-specific store adapter
 * Implements IMapStoreAdapter for React framework
 */

import type {
  IMapStoreAdapter,
  LoggerFunction,
  MapRootStore,
} from '@hungpvq/map-core';
import { logHelper, getMapCoreRootStore } from '@hungpvq/map-core';
import type { Emitter, EventType } from 'mitt';
import { logger } from './logger';
import { getMapMittStore } from './mitt-store';

/**
 * React store adapter
 * Provides React-specific implementations for store operations
 */
export class ReactMapStoreAdapter implements IMapStoreAdapter {
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
    return getMapMittStore<T>(mapId);
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
    logHelper(logger, mapId, 'store')
      .with({ fn: 'log', span: 'store.update' })
      [level](message, data);
  };
}
