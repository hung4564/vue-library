import {
  logHelper,
  MAP_STORE_KEY,
  type MapControlButtonState,
  type MapControlButtonUIState,
} from '@hungpvq/map-core';
import type { WithMapPropType } from '@hungpvq/map-core';
import { createMapScopedStore } from '../../store';
import { logger } from './logger';
export type MapControlButtonInstance = {
  id: string;
  mount(): void;
  unmount(): void;
  sync(): void;
};
type Listener = () => void;
export type MapToolbarStore = {
  buttons: Map<string, MapControlButtonState>;
  listeners: Set<Listener>;
};
export const useMapToolbarStore = (mapId: string) =>
  createMapScopedStore<MapToolbarStore>(mapId, MAP_STORE_KEY.TOOLBAR, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {
      buttons: new Map(),
      listeners: new Set<Listener>(),
    };
  });

export const useMapToolbar = (mapId: string) => {
  const store = useMapToolbarStore(mapId);

  function subscribe(fn: Listener) {
    store.listeners.add(fn);
    return () => store.listeners.delete(fn);
  }

  function notify() {
    store.listeners.forEach((fn) => fn());
  }

  function register(state: MapControlButtonState) {
    store.buttons.set(state.id, state);
    notify();
  }

  function update(id: string, patch: Partial<MapControlButtonState>) {
    const btn = store.buttons.get(id);
    if (!btn) return;
    Object.assign(btn, patch);
    notify();
  }

  function unregister(id: string) {
    store.buttons.delete(id);
    notify();
  }

  function getAll() {
    return Array.from(store.buttons.values()).sort((a, b) => {
      const pa = a.priority ?? 0;
      const pb = b.priority ?? 0;
      if (pa !== pb) return pa - pb;

      const ga = a.group ?? '';
      const gb = b.group ?? '';
      if (ga !== gb) return ga.localeCompare(gb);

      return (a.order ?? 0) - (b.order ?? 0);
    });
  }

  function get(id: string) {
    return store.buttons.get(id);
  }
  return { subscribe, register, unregister, update, getAll, get };
};

export const useMapToolbarModule = (
  mapId: string,
  controlLayout: WithMapPropType['controlLayout'],
) => {
  const store = useMapToolbarStore(mapId);

  function notify() {
    store.listeners.forEach((fn) => fn());
  }

  function register(state: MapControlButtonState) {
    if (controlLayout == 'toolbar') {
      store.buttons.set(state.id, state);
    }
    notify();
  }

  function update(id: string, patch: Partial<MapControlButtonState>) {
    const btn = store.buttons.get(id);
    if (!btn) return;
    Object.assign(btn, patch);
    notify();
  }

  function unregister(id: string) {
    store.buttons.delete(id);
    notify();
  }
  return { register, unregister, update };
};
