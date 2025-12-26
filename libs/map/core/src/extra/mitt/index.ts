import { loggerFactory } from '@hungpvq/shared-log';
import { logHelper } from '@hungpvq/shared-map';
import mitt, { Emitter, EventType } from 'mitt';
import { createMapScopedStore } from '../../store';
import { MAP_STORE_KEY } from '../../types/key';

const loggerEvent = loggerFactory
  .createLogger()
  .setNamespace('map:' + MAP_STORE_KEY.MITT, 2);

export const useMapMittStore = <
  T extends Record<EventType, unknown> = Record<EventType, unknown>,
>(
  mapId: string,
) =>
  createMapScopedStore<Emitter<T>>(mapId, MAP_STORE_KEY.MITT, () => {
    const eventHandle = mitt<T>();
    logHelper(loggerEvent, mapId, 'store').debug('init');
    eventHandle.on('*', (key, params: unknown) => {
      logHelper(loggerEvent, mapId, 'store').debug(`[${String(key)}]`, params);
    });
    return eventHandle;
  });
