import { errorHandler } from '@hungpvq/vue-map-core';
import { toRaw } from 'vue';
import type { BaseMapAdapter } from '../adapter/base';
import { BasemapError } from '../errors';
import type { BaseMapItem } from '../types';

/**
 * Service for managing basemap operations.
 */
export class BasemapService {
  /**
   * Switch to a different basemap.
   * @param map - The map instance
   * @param adapter - The basemap adapter
   * @param baseMap - The basemap to switch to
   */
  static async switchBasemap(
    mapId: string,
    adapter: BaseMapAdapter,
    baseMap: BaseMapItem,
  ): Promise<void> {
    try {
      await adapter.setCurrent(mapId, baseMap);
    } catch (error) {
      const basemapError = new BasemapError(
        `Failed to set current basemap: ${baseMap.title}`,
        {
          context: { basemap: toRaw(baseMap) },
          cause: error,
        },
      );
      errorHandler.handle(basemapError);
      throw basemapError;
    }
  }

  /**
   * Get the default basemap from the list.
   */
  static getDefaultBasemap(
    baseMaps: BaseMapItem[],
    defaultId: string,
    adapter: BaseMapAdapter,
  ): BaseMapItem | undefined {
    return adapter.getIndexDefault(baseMaps, defaultId);
  }
}
