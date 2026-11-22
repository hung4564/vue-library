import { UniversalRegistry } from '@hungpvq/map-core';
import {
  type AddGeojsonHerePayload,
  clearAddGeojsonHereItems,
  getDefaultAddGeojsonHereItems,
  MAP_CONTEXT_MENU_ID,
  type MapMenuItemProps,
  setAddGeojsonHereItems,
} from '@hungpvq/map-core/menu';

import { createGeojsonHereDataset } from '../../geojson/here';
import type { IDataset } from '../../interfaces/dataset.base';

/**
 * Register map-context "Add GeoJSON here" handler + default items.
 * Returns unregister/cleanup for control unmount.
 */
export function registerAddGeojsonHereForMap(
  mapId: string,
  addDataset: (dataset: IDataset) => void | Promise<void>,
): () => void {
  UniversalRegistry.registerMenuHandlerForMap(
    mapId,
    MAP_CONTEXT_MENU_ID.addGeojsonHere,
    (_props: MapMenuItemProps, payload: AddGeojsonHerePayload) => {
      void addDataset(createGeojsonHereDataset(payload));
    },
  );
  setAddGeojsonHereItems(mapId, getDefaultAddGeojsonHereItems());
  return () => {
    UniversalRegistry.unregisterMenuHandlerForMap(
      mapId,
      MAP_CONTEXT_MENU_ID.addGeojsonHere,
    );
    clearAddGeojsonHereItems(mapId);
  };
}
