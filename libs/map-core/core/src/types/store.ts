/**
 * Framework-agnostic store types
 */
import { MapStore } from '../store';
import { MAP_STORE_KEY } from './constants';
import { MittTypeMapCrs, MittTypeMapCrsEventKey } from '../crs/types';
import { MittTypeMapEvent, MittTypeMapEventEventKey } from '../event/types';
import type { MapSimple } from './index';
import { MittTypeMapLang, MittTypeMapLangEventKey } from './lang';

/**
 * Combined event types for all map modules
 */
export type MittTypeMap = MittTypeMapLang & MittTypeMapEvent & MittTypeMapCrs;

/**
 * Event key constants for all map modules
 */
export const MittTypeMapEventKey = {
  [MAP_STORE_KEY.EVENT]: MittTypeMapEventEventKey,
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
