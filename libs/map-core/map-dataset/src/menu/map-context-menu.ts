import type { MapContextMenuTarget } from '@hungpvq/map-core/menu';

import { createMenuBuilder } from './builder';

/**
 * Same chain as `createMenuBuilder()`, typed so `click` / `hidden` receive
 * `{ layer: MapContextMenuTarget, mapId, event, ... }`.
 *
 * For headers (and the same item/divider API without a dataset generic), use
 * `createMapMenuBuilder()` from `@hungpvq/map-core/menu`.
 */
export function createMapContextMenuBuilder() {
  return createMenuBuilder<MapContextMenuTarget>();
}
