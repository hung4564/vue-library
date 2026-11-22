/**
 * Per-map control handles (`UniversalRegistry.registerControl`).
 * Bag: `map:core[mapId][MAP_STORE_KEY.CONTROLS]`.
 */
import {
  deleteMapDomainStore,
  ensureMapDomainStore,
  hasMapDomainStoreFactory,
  peekMapDomainStore,
  registerMapDomainStoreFactory,
} from '../store/map-domain-store';
import { MAP_STORE_KEY } from '../types/constants';
import type { MapControlHandle } from './control';

export type MapControlsStore = Record<string, MapControlHandle>;

function registerControlsFactory() {
  registerMapDomainStoreFactory(MAP_STORE_KEY.CONTROLS, {
    create: (): MapControlsStore => ({}),
  });
}

function ensureControlsFactory() {
  if (!hasMapDomainStoreFactory(MAP_STORE_KEY.CONTROLS)) {
    registerControlsFactory();
  }
}

export function ensureMapControlsStore(mapId: string): MapControlsStore {
  ensureControlsFactory();
  return ensureMapDomainStore<MapControlsStore>(mapId, MAP_STORE_KEY.CONTROLS);
}

export function peekMapControlsStore(
  mapId: string,
): MapControlsStore | undefined {
  return peekMapDomainStore<MapControlsStore>(mapId, MAP_STORE_KEY.CONTROLS);
}

export function clearMapControlsStore(mapId: string): void {
  deleteMapDomainStore(mapId, MAP_STORE_KEY.CONTROLS);
}
