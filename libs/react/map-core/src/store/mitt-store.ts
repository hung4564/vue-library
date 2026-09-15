/**
 * React mitt store implementation
 * Creates event emitters for map instances
 */

import { createMapMitt, logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import type { Emitter, EventType } from 'mitt';
import { logger } from './logger';
import { createMapScopedStore } from './store-utils';

const loggerEvent = logger.setNamespace('map:' + MAP_STORE_KEY.MITT, 2);

/**
 * Get or create mitt event emitter for a map ID
 */
export function getMapMittStore<
  T extends Record<EventType, unknown> = Record<EventType, unknown>,
>(mapId: string): Emitter<T> {
  return createMapScopedStore<Emitter<T>>(mapId, MAP_STORE_KEY.MITT, () => {
    logHelper(loggerEvent, mapId, 'store').debug('init');
    return createMapMitt<T>((key, params) => {
      logHelper(loggerEvent, mapId, 'store').debug(`[${String(key)}]`, params);
    });
  });
}
