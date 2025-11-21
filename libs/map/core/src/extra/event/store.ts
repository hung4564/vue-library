import { logHelper } from '@hungpvq/shared-map';
import { createMapScopedStore } from '../../store';
import { MAP_STORE_KEY } from '../../types/key';
import { logger } from './logger';
import { IEvent } from './types';

export type MapEventStore = {
  items: IEvent[];
  current: { [key: string]: IEvent | undefined };
};
export const useMapEventStore = (mapId: string) =>
  createMapScopedStore<MapEventStore>(mapId, MAP_STORE_KEY.EVENT, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {
      items: [],
      current: {},
    };
  });
