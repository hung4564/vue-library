import { MAP_STORE_KEY } from '../types/constants';
import {
  ensureMapDomainStore,
  registerMapDomainStoreFactory,
} from '../store/map-domain-store';
import { createDefaultCrsStore, type MapCrsStore } from './types';

registerMapDomainStoreFactory(MAP_STORE_KEY.CRS, {
  create: () => createDefaultCrsStore(),
});

export function ensureMapCrsStore(mapId: string): MapCrsStore {
  return ensureMapDomainStore<MapCrsStore>(mapId, MAP_STORE_KEY.CRS);
}
