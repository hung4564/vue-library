import { loggerFactory } from '@hungpvq/shared-log';
import { logHelper, MAP_STORE_KEY, createMapMitt } from '@hungpvq/map-core';
import { Emitter, EventType } from 'mitt';
import { createMapScopedStore } from '../../store';

const loggerEvent = loggerFactory
  .createLogger()
  .setNamespace('map:' + MAP_STORE_KEY.MITT, 2);

export const useMapMittStore = <
  T extends Record<EventType, unknown> = Record<EventType, unknown>,
>(
  mapId: string,
) =>
  createMapScopedStore<Emitter<T>>(mapId, MAP_STORE_KEY.MITT, () => {
    logHelper(loggerEvent, mapId, 'store').debug('init');
    return createMapMitt<T>((key, params) => {
      logHelper(loggerEvent, mapId, 'store').debug(`[${String(key)}]`, params);
    });
  });
