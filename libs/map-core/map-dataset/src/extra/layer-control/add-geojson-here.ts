import {
  clearAddGeojsonHereItems,
  getDefaultAddGeojsonHereItems,
  MAP_CONTEXT_MENU_ID,
  setAddGeojsonHereItems,
  type AddGeojsonHerePayload,
  type MapMenuItemProps,
} from '@hungpvq/map-core/menu';
import { UniversalRegistry } from '@hungpvq/map-core';
import type { IDataset } from '../../interfaces/dataset.base';
import { createGeojsonHereDataset } from '../../geojson/here';

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
