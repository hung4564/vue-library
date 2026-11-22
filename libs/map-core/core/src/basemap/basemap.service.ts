/**
 * Public basemap helpers (error wrapping + default resolve).
 * Hot path applies go through {@link BasemapManager} → these methods.
 */

import { errorHandler } from '../services/error-handler.service';
import { BaseMapAdapter } from './adapter/BaseMapAdapter';
import { BasemapError } from './errors';
import type { BaseMapItem } from './types';

export class BasemapService {
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

  static getDefaultBasemap(
    baseMaps: BaseMapItem[],
    defaultId: string,
    adapter: BaseMapAdapter,
  ): BaseMapItem | undefined {
    return adapter.getIndexDefault(baseMaps, defaultId);
  }
}
