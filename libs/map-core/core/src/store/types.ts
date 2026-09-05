/**
 * Framework-agnostic store types for map core
 */

import type { MapSimple } from '../types';

/**
 * Map store structure
 */
export type MapStore = {
  map?: MapSimple;
  maps?: MapSimple[];
  isMulti?: boolean;
  [key: string]: any;
};

/**
 * Root store structure
 */
export type MapRootStore = Record<string, MapStore>;

/**
 * Default value type (can be a value or factory function)
 */
export type DefaultValue<T> = T | (() => T);

/**
 * Store cleanup function
 */
export type StoreCleanup = () => void | Promise<void>;

/**
 * Options for adding store entries
 */
export type AddStoreOptions = {
  cleanup?: StoreCleanup;
};

/**
 * Internal store structure with cleanup tracking
 */
export type MapStoreInternal = MapStore & {
  __cleanup__?: Record<string, StoreCleanup[]>;
};
