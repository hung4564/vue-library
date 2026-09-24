import { isUsableMapId } from '@hungpvq/map-core';
import {
  createDefaultMapDatasetStore,
  ensureMapDatasetStore,
  type MapDatasetStore,
  notifyMapDatasetStore,
} from '@hungpvq/map-dataset';

/** @deprecated Prefer {@link MapDatasetStore} from `@hungpvq/map-dataset`. */
export type MapLayerStore = MapDatasetStore;

export function notify(store: MapDatasetStore) {
  notifyMapDatasetStore(store);
}

export { notifyMapDatasetStore };

const EMPTY_MAP_LAYER_STORE: MapDatasetStore = createDefaultMapDatasetStore();

/** Imperative store accessor (safe outside React render). */
export function getMapDatasetStore(mapId: string): MapDatasetStore {
  if (!isUsableMapId(mapId)) {
    throw new Error('mapId is required');
  }
  return ensureMapDatasetStore(mapId);
}

export function useMapDatasetStore(mapId: string): MapDatasetStore {
  if (!isUsableMapId(mapId)) return EMPTY_MAP_LAYER_STORE;
  return getMapDatasetStore(mapId);
}
