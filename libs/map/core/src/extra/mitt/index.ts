import { loggerFactory } from '@hungpvq/shared-log';
import { logHelper } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import mitt, { Emitter, EventType } from 'mitt';
import { MAP_STORE_KEY } from '../../types/key';
const loggerEvent = loggerFactory
  .createLogger()
  .setNamespace('map:' + MAP_STORE_KEY.MITT, 2);

export const useMapMittStore = <T extends Record<EventType, unknown> = any>(
  mapId: string,
) =>
  defineStore<Emitter<T>>(['map:core', mapId, MAP_STORE_KEY.MITT], () => {
    const eventHandle = mitt<T>();
    logHelper(loggerEvent, mapId, 'store').debug('init');
    eventHandle.on('*', (key, ...params: any) => {
      logHelper(loggerEvent, mapId, 'store').debug(`[${String(key)}]`, params);
    });
    return eventHandle;
  })();
