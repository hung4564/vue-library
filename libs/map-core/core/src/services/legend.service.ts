/**
 * Framework-agnostic legend service
 */

import type { MapSimple } from '../types';
import { MapError } from '../errors';
import { errorHandler } from './error-handler.service';
import type { LegendItem, LayerConfig } from '../types/legend';

/**
 * Service for managing legend operations
 */
export class LegendService {
  /**
   * Generate legend items from layer configurations
   *
   * @param layers - Array of layer configurations
   * @returns Array of legend items
   */
  static generateLegendItems(layers: LayerConfig[]): LegendItem[] {
    try {
      return layers.map((layer) => ({
        id: layer.id,
        title: layer.title || layer.id,
        visible: layer.visible !== false,
      }));
    } catch (error) {
      const legendError = new MapError(
        'Failed to generate legend items',
        'LEGEND_ERROR',
        { recoverable: true, cause: error },
      );
      errorHandler.handle(legendError);
      return [];
    }
  }

  /**
   * Toggle layer visibility on the map
   *
   * @param map - The map instance
   * @param layerId - Layer ID to toggle
   * @param visible - Visibility state (true = visible, false = hidden)
   * @throws MapError if toggling fails
   */
  static async toggleLayerVisibility(
    map: MapSimple,
    layerId: string,
    visible: boolean,
  ): Promise<void> {
    try {
      const layer = map.getLayer(layerId);
      if (layer) {
        map.setLayoutProperty(
          layerId,
          'visibility',
          visible ? 'visible' : 'none',
        );
      }
    } catch (error) {
      const legendError = new MapError(
        `Failed to toggle layer visibility: ${layerId}`,
        'LEGEND_ERROR',
        {
          context: { layerId, visible },
          cause: error,
        },
      );
      errorHandler.handle(legendError);
      throw legendError;
    }
  }
}
