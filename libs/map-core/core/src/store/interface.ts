/**
 * Framework-agnostic store adapter interface
 */

import type { Emitter, EventType } from 'mitt';
import type { MapRootStore } from './types';

// MapFCOnUseMap is exported from ../utils/types
// Re-export it here for backward compatibility with store interface
export type { MapFCOnUseMap } from '../types';

/**
 * Event emitter type (using mitt)
 */
export type EventEmitter<
  T extends Record<EventType, unknown> = Record<EventType, unknown>,
> = Emitter<T>;

/**
 * Logger function type
 */
export type LoggerFunction = (
  mapId: string,
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data?: any,
) => void;

/**
 * Store adapter interface
 * Framework-specific implementations must provide these methods
 */
export interface IMapStoreAdapter {
  /**
   * Get the root store instance
   */
  getRootStore(): MapRootStore;

  /**
   * Get event emitter for a specific map ID
   */
  getEventEmitter<
    T extends Record<EventType, unknown> = Record<EventType, unknown>,
  >(
    mapId: string,
  ): EventEmitter<T>;

  /**
   * Optional logger function
   * If not provided, no logging will occur
   */
  log?: LoggerFunction;
}
