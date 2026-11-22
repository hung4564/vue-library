import { getOrCreateStore } from '@hungpvq/shared-store';

/** Process-wide debug bag for dataset pin + install flag. */
export const MAP_DEBUG_STORE_KEY = 'map:debug';

export type MapDebugStore = {
  dataset?: unknown;
  installed: boolean;
  __cleanup__: Array<() => void>;
  errorUnsub?: () => void;
};

export function getMapDebugStore(): MapDebugStore {
  return getOrCreateStore<MapDebugStore>(MAP_DEBUG_STORE_KEY, () => ({
    installed: false,
    __cleanup__: [],
  }));
}

export function addClearFunctionLog(cleanup: () => void): void {
  const bag = getMapDebugStore();
  if (!bag.__cleanup__) bag.__cleanup__ = [];
  bag.__cleanup__.push(cleanup);
}

export function isMapDevtoolsInstalled(): boolean {
  return getMapDebugStore().installed;
}

export function setMapDevtoolsInstalled(installed: boolean): void {
  getMapDebugStore().installed = installed;
}
