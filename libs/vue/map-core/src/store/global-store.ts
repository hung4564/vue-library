/**
 * Vue global store definition
 * Separated to avoid circular dependencies
 */

import { defineStore } from '@hungpvq/shared-store';
import type { MapStore } from '@hungpvq/map-core';

const MAP_CORE_STORE_ID = 'map:core';

type MapRootStore = Record<string, MapStore>;

/**
 * Vue global store
 */
export const useMapGLobalStore = defineStore<MapRootStore>(
  MAP_CORE_STORE_ID,
  () => ({}),
);
