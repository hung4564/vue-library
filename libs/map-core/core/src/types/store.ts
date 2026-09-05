/**
 * Framework-agnostic store types
 */
import { MapStore } from '../store';
import { MittTypeMapCompare, MittTypeMapCompareEventKey } from './compare';
import { MAP_STORE_KEY } from './constants';
import { MittTypeMapCrs, MittTypeMapCrsEventKey } from './crs';
import { MittTypeMapEvent, MittTypeMapEventEventKey } from './event';
import type { MapSimple } from './index';
import { MittTypeMapLang, MittTypeMapLangEventKey } from './lang';

/**
 * Core map store type
 */

/**
 * Combined event types for all map modules
 */
export type MittTypeMap = MittTypeMapCompare &
  MittTypeMapLang &
  MittTypeMapEvent &
  MittTypeMapCrs;

/**
 * Event key constants for all map modules
 */
export const MittTypeMapEventKey = {
  [MAP_STORE_KEY.EVENT]: MittTypeMapEventEventKey,
  [MAP_STORE_KEY.MAP_COMPARE]: MittTypeMapCompareEventKey,
  [MAP_STORE_KEY.LANG]: MittTypeMapLangEventKey,
  [MAP_STORE_KEY.CRS]: MittTypeMapCrsEventKey,
} as const;

/**
 * Type guard: Check if store has a single map instance
 */
export function hasMapInstance(
  store?: MapStore,
): store is MapStore & { map: MapSimple } {
  return !!store?.map;
}

/**
 * Type guard: Check if store has a collection of maps
 */
export function hasMapCollection(
  store?: MapStore,
): store is MapStore & { maps: MapSimple[] } {
  return Array.isArray(store?.maps) && !!store?.maps?.length;
}

/**
 * Type guard: Check if store is a multi-map store
 */
export function isMultiMapStore(
  store?: MapStore,
): store is MapStore & { isMulti: true } {
  return !!store?.isMulti;
}
