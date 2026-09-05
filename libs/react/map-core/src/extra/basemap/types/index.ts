/**
 * React-specific basemap types
 * Framework-agnostic types are available directly from @hungpvq/map-core
 */

import type {
  BaseMapAdapter,
  BaseMapStore as BaseMapStoreCore,
} from '@hungpvq/map-core';

/**
 * React-specific BaseMapStore type
 * Extends the core type with React-specific adapter
 */
export type BaseMapStore = Omit<BaseMapStoreCore, 'adapter'> & {
  adapter: BaseMapAdapter;
};
