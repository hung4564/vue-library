/**
 * Framework-agnostic basemap service
 */

import type { BaseMapItem } from '../types';
import { BaseMapAdapter } from '../adapter';
import { BasemapError } from '../errors';
import { errorHandler } from './error-handler.service';

/**
 * Service for managing basemap operations
 */
export class BasemapService {
  /**
   * Switch to a different basemap
   * Framework-agnostic implementation
   *
   * @param mapId - Map instance identifier
   * @param adapter - The basemap adapter
   * @param baseMap - The basemap to switch to
   * @throws BasemapError if switching fails
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
          context: { basemap: baseMap },
          cause: error,
        },
      );
      errorHandler.handle(basemapError);
      throw basemapError;
    }
  }

  /**
   * Get the default basemap from the list
   * This is a framework-agnostic utility method
   *
   * @param baseMaps - Array of basemap items
   * @param defaultId - Default basemap identifier
   * @param adapter - Basemap adapter instance
   * @returns Default basemap item or undefined
   */
  static getDefaultBasemap(
    baseMaps: BaseMapItem[],
    defaultId: string,
    adapter: BaseMapAdapter,
  ): BaseMapItem | undefined {
    return adapter.getIndexDefault(baseMaps, defaultId);
  }
}
