import { loggerFactory } from '@hungpvq/shared-log';
import { logHelper } from '@hungpvq/shared-map';
import mitt, { Emitter } from 'mitt';
import { addStore, addToQueue } from '../../store';
import { MAP_STORE_KEY } from '../../types/key';
const loggerEvent = loggerFactory
  .createLogger()
  .setNamespace('map:' + MAP_STORE_KEY.MITT, 2);
loggerFactory.disable('map:' + MAP_STORE_KEY.MITT);
export function initStoreMitt(mapId: string) {
  const eventHandle = mitt();
  logHelper(loggerEvent, mapId, 'store').debug('init');
  addStore<Emitter<any>>(mapId, MAP_STORE_KEY.MITT, eventHandle);
  eventHandle.on('*', (key, ...params: any) => {
    logHelper(loggerEvent, mapId, 'store').debug(`[${String(key)}]`, params);
  });
}

addToQueue(MAP_STORE_KEY.MITT, initStoreMitt);
