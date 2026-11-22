import type { ResolvedControlLayout } from '@hungpvq/map-core';
import {
  createToolbarModuleApi,
  ensureMapToolbarApi,
  ensureMapToolbarStore,
  type MapToolbarStore,
} from '@hungpvq/map-core/toolbar';

export type { MapToolbarStore };

export const useMapToolbarStore = (mapId: string) =>
  ensureMapToolbarStore(mapId);

export const useMapToolbar = (mapId: string) => ensureMapToolbarApi(mapId);

export const useMapToolbarModule = (
  mapId: string,
  controlLayout:
    | ResolvedControlLayout
    | 'button'
    | undefined
    | (() => ResolvedControlLayout | 'button' | undefined),
) => {
  const store = useMapToolbarStore(mapId);
  return createToolbarModuleApi(store, controlLayout);
};
