/**
 * Per-map namespaced method / menu / component bags (`UniversalRegistry`).
 * Bag: `map:core[mapId][MAP_STORE_KEY.REGISTRY_MAPS]`.
 */
import {
  deleteMapDomainStore,
  ensureMapDomainStore,
  hasMapDomainStoreFactory,
  peekMapDomainStore,
  registerMapDomainStoreFactory,
} from '../store/map-domain-store';
import { MAP_STORE_KEY } from '../types/constants';

export type MapRegistryMapsStore = Record<string, unknown>;

function registerRegistryMapsFactory() {
  registerMapDomainStoreFactory(MAP_STORE_KEY.REGISTRY_MAPS, {
    create: (): MapRegistryMapsStore => ({}),
  });
}

function ensureRegistryMapsFactory() {
  if (!hasMapDomainStoreFactory(MAP_STORE_KEY.REGISTRY_MAPS)) {
    registerRegistryMapsFactory();
  }
}

export function ensureMapRegistryMapsStore(
  mapId: string,
): MapRegistryMapsStore {
  ensureRegistryMapsFactory();
  return ensureMapDomainStore<MapRegistryMapsStore>(
    mapId,
    MAP_STORE_KEY.REGISTRY_MAPS,
  );
}

export function peekMapRegistryMapsStore(
  mapId: string,
): MapRegistryMapsStore | undefined {
  return peekMapDomainStore<MapRegistryMapsStore>(
    mapId,
    MAP_STORE_KEY.REGISTRY_MAPS,
  );
}

export function clearMapRegistryMapsStore(mapId: string): void {
  deleteMapDomainStore(mapId, MAP_STORE_KEY.REGISTRY_MAPS);
}
