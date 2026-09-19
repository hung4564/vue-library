import { getMap } from '../store/map-platform-registry';
import { MAP_STORE_KEY } from '../types/constants';
import {
  ensureMapDomainStore,
  registerMapDomainStoreFactory,
} from '../store/map-domain-store';
import { createDefaultBaseMapAdapter } from './adapter/DefaultBaseMapAdapter';
import { createDefaultBaseMapStore, type BaseMapStore } from './types';

registerMapDomainStoreFactory(MAP_STORE_KEY.BASEMAP, {
  create: () =>
    createDefaultBaseMapStore(createDefaultBaseMapAdapter(getMap)),
});

export function ensureMapBaseMapStore(mapId: string): BaseMapStore {
  return ensureMapDomainStore<BaseMapStore>(mapId, MAP_STORE_KEY.BASEMAP);
}
