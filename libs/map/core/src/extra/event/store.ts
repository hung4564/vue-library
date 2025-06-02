import { logHelper } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import { MAP_STORE_KEY } from '../../types/key';
import { logger } from './logger';
import { IEvent, MittTypeMapEvent, MittTypeMapEventEventKey } from './types';

export type MapEventStore = {
  items: IEvent[];
  current: { [key: string]: IEvent | undefined };
};
export const useMapEventStore = (mapId: string) =>
  defineStore<MapEventStore>(['map:core', mapId, MAP_STORE_KEY.EVENT], () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {
      items: [],
      current: {},
    };
  })();
