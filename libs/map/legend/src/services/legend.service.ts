import { MapError, errorHandler } from '@hungpvq/vue-map-core';

/**
 * Service for managing legend operations.
 */
export class LegendService {
  /**
   * Generate legend items from layer configurations.
   */
  static generateLegendItems(layers: any[]): any[] {
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
    map: any,
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
        { layerId, visible, error: (error as Error).message },
        true,
      );
      errorHandler.handle(legendError);
      throw legendError;
    }
  }
}
