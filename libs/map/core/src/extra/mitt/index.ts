import { loggerFactory } from '@hungpvq/shared-log';
import { logHelper } from '@hungpvq/shared-map';
import mitt, { Emitter, EventType } from 'mitt';
import { createMapScopedStore } from '../../store';
import { MAP_STORE_KEY } from '../../types/key';
const loggerEvent = loggerFactory
  .createLogger()
  .setNamespace('map:' + MAP_STORE_KEY.MITT, 2);

export const useMapMittStore = <T extends Record<EventType, unknown> = any>(
  mapId: string,
) =>
  createMapScopedStore<Emitter<T>>(mapId, MAP_STORE_KEY.MITT, () => {
    const eventHandle = mitt<T>();
    logHelper(loggerEvent, mapId, 'store').debug('init');
    eventHandle.on('*', (key, ...params: any) => {
      logHelper(loggerEvent, mapId, 'store').debug(`[${String(key)}]`, params);
    });
    return eventHandle;
  });
