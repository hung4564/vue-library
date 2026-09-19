import { createMapMitt, logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import type { Emitter, EventType } from 'mitt';
import { logger } from './logger';
import { createMapScopedStore } from './store';

const loggerEvent = logger.setNamespace('map:' + MAP_STORE_KEY.MITT, 2);

/**
 * Get or create mitt event emitter for a map ID.
 * Prefer this name outside components/hooks when an imperative API is clearer.
 */
export function getMapMittStore<
  T extends Record<EventType, unknown> = Record<EventType, unknown>,
>(mapId: string): Emitter<T> {
  return createMapScopedStore<Emitter<T>>(mapId, MAP_STORE_KEY.MITT, () => {
    logHelper(loggerEvent, mapId, 'store')
      .with({ fn: 'getMapMittStore', span: 'store.init' })
      .debug('init');
    return createMapMitt<T>();
  });
}

/** Parity alias with React `useMapMittStore` — prefer in components / composables. */
export const useMapMittStore = getMapMittStore;
