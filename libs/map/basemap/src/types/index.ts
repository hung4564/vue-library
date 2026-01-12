/**
 * Vue-specific basemap types
 * Framework-agnostic types are available directly from @hungpvq/map-core
 */

import type {
  BaseMapAdapter,
  BaseMapStore as BaseMapStoreCore,
} from '@hungpvq/map-core';

/**
 * Vue-specific BaseMapStore type
 * Extends the core type with Vue-specific adapter
 */
export type BaseMapStore = Omit<BaseMapStoreCore, 'adapter'> & {
  adapter: BaseMapAdapter;
};
