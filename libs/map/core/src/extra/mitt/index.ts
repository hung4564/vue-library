import mitt, { Emitter } from 'mitt';
import { addStore, addToQueue } from '../../store';
import { MAP_STORE_KEY } from '../../types/key';

export function initStoreMitt(mapId: string) {
  addStore<Emitter<any>>(mapId, MAP_STORE_KEY.MITT, mitt());
}

addToQueue(MAP_STORE_KEY.MITT, initStoreMitt);
