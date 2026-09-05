import type { MapContextMenuTarget } from '@hungpvq/map-core';
import { createMenuBuilder } from './builder';

/**
 * Same chain as `createMenuBuilder()`, typed so `click` / `hidden` receive
 * `{ layer: MapContextMenuTarget, mapId, event, ... }`.
 *
 * For headers (and the same item/divider API without a dataset generic), use
 * `createMapMenuBuilder()` from `@hungpvq/map-core`.
 */
export function createMapContextMenuBuilder() {
  return createMenuBuilder<MapContextMenuTarget>();
}

export {
  clearAddGeojsonHereItems,
  createAddGeojsonHereDef,
  createBufferHereDef,
  createDefaultMapContextMenuItems,
  createMapMenuBuilder,
  createMenuItemCenterMapHere,
  createMenuItemCopyAsGeojson,
  createMenuItemCopyCoords,
  createMenuItemCopyWkt,
  createMenuItemGoogleEarth,
  createMenuItemGoogleMaps,
  createMenuItemIdentifyHere,
  createMenuItemQuickAnalysis,
  createMenuItemZoomInHere,
  getDefaultAddGeojsonHereItems,
  MAP_CONTEXT_MENU_ID,
  setAddGeojsonHereItems,
} from '@hungpvq/map-core';

export { createGeojsonHereDataset } from './add-geojson-here';

export type {
  AddGeojsonHerePayload,
  MapAddGeojsonHereDef,
  MapAddGeojsonHereLayerType,
  MapContextMenuItem,
  MapContextMenuItemId,
  MapContextMenuTarget,
} from '@hungpvq/map-core';
