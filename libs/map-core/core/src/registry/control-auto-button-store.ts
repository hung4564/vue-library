/**
 * Auto-button descriptors for ModuleContainer when no custom btn slot is provided.
 * Framework adapters register UI state getters; ModuleContainer renders MapCommonButton.
 * Bag: `map:core[mapId][MAP_STORE_KEY.CONTROL_AUTO_BUTTON]`.
 */
import {
  getMapCoreMetaStore,
  type MapCoreMetaStore,
} from '../store/map-core-meta';
import {
  deleteMapDomainStore,
  ensureMapDomainStore,
  hasMapDomainStoreFactory,
  peekMapDomainStore,
  registerMapDomainStoreFactory,
} from '../store/map-domain-store';
import { MAP_STORE_KEY } from '../types/constants';

export type ControlAutoButtonEntry = {
  /** Opaque UI state for MapCommonButton (`MapControlButtonUIState`). */
  getUiState: () => unknown;
  onAction: (event?: unknown) => void;
};

export type MapControlAutoButtonStore = {
  byId: Record<string, ControlAutoButtonEntry>;
};

type AutoButtonListener = (mapId: string, controlId: string) => void;

type MetaWithAutoButtonListeners = MapCoreMetaStore & {
  controlAutoButtonListeners?: Set<AutoButtonListener>;
};

function autoButtonListeners(): Set<AutoButtonListener> {
  const meta = getMapCoreMetaStore() as MetaWithAutoButtonListeners;
  if (!meta.controlAutoButtonListeners) {
    meta.controlAutoButtonListeners = new Set();
  }
  return meta.controlAutoButtonListeners;
}

function registerControlAutoButtonFactory() {
  registerMapDomainStoreFactory(MAP_STORE_KEY.CONTROL_AUTO_BUTTON, {
    create: (): MapControlAutoButtonStore => ({ byId: {} }),
  });
}

function ensureAutoButtonFactory() {
  if (!hasMapDomainStoreFactory(MAP_STORE_KEY.CONTROL_AUTO_BUTTON)) {
    registerControlAutoButtonFactory();
  }
}

function ensureAutoButtonStore(mapId: string): MapControlAutoButtonStore {
  ensureAutoButtonFactory();
  return ensureMapDomainStore<MapControlAutoButtonStore>(
    mapId,
    MAP_STORE_KEY.CONTROL_AUTO_BUTTON,
  );
}

function peekAutoButtonStore(
  mapId: string,
): MapControlAutoButtonStore | undefined {
  return peekMapDomainStore<MapControlAutoButtonStore>(
    mapId,
    MAP_STORE_KEY.CONTROL_AUTO_BUTTON,
  );
}

function notify(mapId: string, controlId: string) {
  autoButtonListeners().forEach((listener) => listener(mapId, controlId));
}

export function registerControlAutoButton(
  mapId: string,
  controlId: string,
  entry: ControlAutoButtonEntry,
): void {
  const bag = ensureAutoButtonStore(mapId);
  bag.byId[controlId] = entry;
  notify(mapId, controlId);
}

/** Notify ModuleContainer that auto-button UI state changed. */
export function notifyControlAutoButton(
  mapId: string,
  controlId: string,
): void {
  notify(mapId, controlId);
}

export function unregisterControlAutoButton(
  mapId: string,
  controlId: string,
): void {
  const bag = peekAutoButtonStore(mapId);
  if (!bag || !(controlId in bag.byId)) return;
  delete bag.byId[controlId];
  notify(mapId, controlId);
}

export function getControlAutoButton(
  mapId: string,
  controlId: string,
): ControlAutoButtonEntry | undefined {
  return peekAutoButtonStore(mapId)?.byId[controlId];
}

export function clearControlAutoButtonsForMap(mapId: string): void {
  if (!peekAutoButtonStore(mapId)) return;
  deleteMapDomainStore(mapId, MAP_STORE_KEY.CONTROL_AUTO_BUTTON);
  autoButtonListeners().forEach((listener) => listener(mapId, '*'));
}

export function subscribeControlAutoButton(
  listener: AutoButtonListener,
): () => void {
  const listeners = autoButtonListeners();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
