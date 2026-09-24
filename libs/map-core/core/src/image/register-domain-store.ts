import {
  ensureMapDomainStore,
  registerMapDomainStoreFactory,
} from '../store/map-domain-store';
import { getMap } from '../store/map-platform-registry';
import { MAP_STORE_KEY } from '../types/constants';
import { createMapImageStoreApi } from './store-api';
import { createDefaultImageStore, type MapImageStore } from './types';

registerMapDomainStoreFactory(MAP_STORE_KEY.IMAGE, {
  create: () => createDefaultImageStore(),
});

export function ensureMapImageStore(mapId: string): MapImageStore {
  return ensureMapDomainStore<MapImageStore>(mapId, MAP_STORE_KEY.IMAGE);
}

/** Framework-agnostic image API using platform `getMap`. */
export function ensureMapImageApi(mapId: string) {
  const store = ensureMapImageStore(mapId);
  return createMapImageStoreApi(store, (fn) => getMap(mapId, fn));
}
