import { MAP_STORE_KEY } from '../types/constants';
import {
  ensureMapDomainStore,
  registerMapDomainStoreFactory,
} from '../store/map-domain-store';
import {
  createDefaultToolbarStore,
  createToolbarStoreApi,
  type MapToolbarStore,
} from './toolbar';

registerMapDomainStoreFactory(MAP_STORE_KEY.TOOLBAR, {
  create: () => createDefaultToolbarStore(),
});

export function ensureMapToolbarStore(mapId: string): MapToolbarStore {
  return ensureMapDomainStore<MapToolbarStore>(mapId, MAP_STORE_KEY.TOOLBAR);
}

export function ensureMapToolbarApi(mapId: string) {
  return createToolbarStoreApi(ensureMapToolbarStore(mapId));
}
