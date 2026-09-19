import { MAP_STORE_KEY } from '../types/constants';
import {
  ensureMapDomainStore,
  registerMapDomainStoreFactory,
} from '../store/map-domain-store';
import { createDefaultEventStore, type MapEventStore } from './types';

registerMapDomainStoreFactory(MAP_STORE_KEY.EVENT, {
  create: () => createDefaultEventStore(),
  cleanup: (_mapId, store) => {
    store.items.length = 0;
    store.current = {};
  },
});

export function ensureMapEventStore(mapId: string): MapEventStore {
  return ensureMapDomainStore<MapEventStore>(mapId, MAP_STORE_KEY.EVENT);
}
