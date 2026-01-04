import type { MapSimple } from '@hungpvq/shared-map';
import { MapError, errorHandler } from '@hungpvq/vue-map-core';

export interface PrintOptions {
  format?: 'png' | 'pdf';
  dpi?: number;
  title?: string;
  description?: string;
}

/**
 * Service for map printing operations.
 */
export class PrintService {
  /**
   * Generate a printable image from the map.
   */
  static async generatePrintImage(
    map: MapSimple,
    options: PrintOptions = {},
  ): Promise<string> {
    try {
      const canvas = map.getCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      return dataUrl;
    } catch (error) {
      const printError = new MapError(
        'Failed to generate print image',
        'PRINT_ERROR',
        {
          context: { mapId: map.id },
          cause: error,
          recoverable: true,
        },
      );
      errorHandler.handle(printError);
      throw printError;
    }
  }

  /**
   * Download the map as an image file.
   */
  static async downloadMapImage(
    map: MapSimple,
    filename = 'map.png',
    options: PrintOptions = {},
  ): Promise<void> {
    try {
      const dataUrl = await PrintService.generatePrintImage(map, options);
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      const printError = new MapError(
        'Failed to download map image',
        'PRINT_ERROR',
        {
          context: { mapId: map.id },
          cause: error,
          recoverable: true,
        },
      );
      errorHandler.handle(printError);
      throw printError;
    }
  }
}
