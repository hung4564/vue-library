import {
  ensureMapDomainStore,
  registerMapDomainStoreFactory,
} from '../store/map-domain-store';
import { MAP_STORE_KEY } from '../types/constants';
import {
  createDefaultPrintStore,
  createPrintStoreApi,
  type MapPrintStore,
} from './types';

registerMapDomainStoreFactory(MAP_STORE_KEY.PRINT, {
  create: () => createDefaultPrintStore(),
});

export function ensureMapPrintStore(mapId: string): MapPrintStore {
  return ensureMapDomainStore<MapPrintStore>(mapId, MAP_STORE_KEY.PRINT);
}

export function ensureMapPrintApi(mapId: string) {
  return createPrintStoreApi(ensureMapPrintStore(mapId));
}
