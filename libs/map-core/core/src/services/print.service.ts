/**
 * Framework-agnostic print service
 */

import type { MapSimple, PrintOptions } from '../types';
import { MapError } from '../errors';
import { errorHandler } from './error-handler.service';
import { exportMapbox, exportMapboxWithOptions } from '../utils';

/**
 * Service for map printing operations
 */
export class PrintService {
  /**
   * Generate a printable image from the map
   *
   * @param map - The map instance
   * @param options - Print options (currently unused but kept for API compatibility)
   * @returns Promise that resolves with image data URL
   * @throws MapError if generation fails
   */
  static async generatePrintImage(
    map: MapSimple,
    _options: PrintOptions = {},
  ): Promise<string> {
    try {
      return await exportMapbox(map);
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
   * Generate a printable image with custom dimensions
   *
   * @param map - The map instance
   * @param options - Print options with dimensions
   * @returns Promise that resolves with image data URL
   * @throws MapError if generation fails
   */
  static async generatePrintImageWithOptions(
    map: MapSimple,
    options: {
      width: number;
      height: number;
      startX?: number;
      startY?: number;
    },
  ): Promise<string> {
    try {
      return await exportMapboxWithOptions(map, {
        width: options.width,
        height: options.height,
        startX: options.startX ?? 0,
        startY: options.startY ?? 0,
      });
    } catch (error) {
      const printError = new MapError(
        'Failed to generate print image with options',
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
   * Download the map as an image file
   * Uses browser DOM API (document.createElement)
   *
   * @param map - The map instance
   * @param filename - Filename for the downloaded file (default: 'map.png')
   * @param options - Print options
   * @returns Promise that resolves when download is triggered
   * @throws MapError if download fails
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
