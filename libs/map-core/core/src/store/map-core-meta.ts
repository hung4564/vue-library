import { getOrCreateStore } from '@hungpvq/shared-store';
import type { MapErrorHandler } from '../services/error-handler.service';

/** Process-wide bag shared across Vue/React and duplicate package copies. */
export const MAP_CORE_META_STORE_KEY = 'map:core:meta';

export type MapCoreErrorCaptureSlot = {
  installed: boolean;
  uninstall: (() => void) | undefined;
};

export type MapCoreMetaStore = {
  /** Tombstones after `removeMap` so getMap/subscribeMapReady do not wait. */
  removedMapIds: Set<string>;
  /** Idempotent window error / unhandledrejection install state. */
  errorCapture: MapCoreErrorCaptureSlot;
  /** Centralized map error handler singleton (filled by error-handler.service). */
  errorHandler?: MapErrorHandler;
};

export function getMapCoreMetaStore(): MapCoreMetaStore {
  const meta = getOrCreateStore<MapCoreMetaStore>(MAP_CORE_META_STORE_KEY, () => ({
    removedMapIds: new Set<string>(),
    errorCapture: {
      installed: false,
      uninstall: undefined,
    },
  }));
  // Hot reload / older bags may lack newer fields.
  if (!meta.removedMapIds) {
    meta.removedMapIds = new Set();
  }
  if (!meta.errorCapture) {
    meta.errorCapture = {
      installed: false,
      uninstall: undefined,
    };
  }
  return meta;
}
