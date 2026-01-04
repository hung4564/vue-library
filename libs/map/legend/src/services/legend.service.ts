import type { MapSimple } from '@hungpvq/shared-map';
import { MapError, errorHandler } from '@hungpvq/vue-map-core';

export interface LegendItem {
  id: string;
  title: string;
  visible: boolean;
}

export interface LayerConfig {
  id: string;
  title?: string;
  visible?: boolean;
}

/**
 * Service for managing legend operations.
 */
export class LegendService {
  /**
   * Generate legend items from layer configurations.
   */
  static generateLegendItems(layers: LayerConfig[]): LegendItem[] {
    try {
      // Legend generation logic
      return layers.map((layer) => ({
        id: layer.id,
        title: layer.title || layer.id,
        visible: layer.visible !== false,
        // Add more legend properties
      }));
    } catch (error) {
      console.error('Failed to generate legend items:', error);
      return [];
    }
  }

  /**
   * Toggle layer visibility.
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
