/**
 * Framework-agnostic map initialization service
 * Handles map instance creation, event setup, and cleanup
 */

import type { MapSimple } from '../types';
import type { MapOptions } from 'maplibre-gl';
import { MapEventError, MapInitializationError } from '../errors';

/**
 * Map event callbacks interface
 */
export interface MapEventCallbacks {
  onLoad?: (map: MapSimple) => void;
  onError?: (error: Error) => void;
  onDestroy?: (map: MapSimple) => void;
}

/**
 * Map initialization service
 * Provides framework-agnostic map instance creation and management
 */
export class MapInitializer {
  /**
   * Check if WebGL is supported in the current browser
   *
   * @returns true if WebGL is supported, false otherwise
   */
  static isWebglSupported(): boolean {
    if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
      return false;
    }

    const canvas = document.createElement('canvas');
    try {
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (context && typeof context.getParameter === 'function') {
        return true;
      }
    } catch (e) {
      // WebGL is supported, but disabled
    }
    return false;
  }

  /**
   * Validate WebGL support and throw error if not supported
   *
   * @param mapId - Map ID for error context
   * @throws MapInitializationError if WebGL is not supported
   */
  static validateWebglSupport(mapId: string): void {
    if (!MapInitializer.isWebglSupported()) {
      throw new MapInitializationError(
        'WebGL is not supported in this browser',
        {
          context: {
            userAgent:
              typeof navigator !== 'undefined'
                ? navigator.userAgent
                : 'unknown',
            mapId,
          },
        },
      );
    }
  }

  /**
   * Create default map options
   *
   * @param customOptions - Custom options to merge
   * @returns Merged map options
   */
  static createDefaultOptions(
    customOptions?: Partial<MapOptions>,
  ): Partial<MapOptions> {
    const defaultOptions: Partial<MapOptions> = {
      center: [105.19084739818732, 15.827971829957548],
      zoom: 5.297175623863693,
      maxZoom: 22,
      attributionControl: false,
    };

    return Object.assign({}, defaultOptions, customOptions);
  }

  /**
   * Create map style configuration
   *
   * @param customStyle - Custom style to merge
   * @returns Map style configuration
   */
  static createMapStyle(customStyle?: Partial<MapOptions['style']>) {
    const defaultStyle = {
      version: 8,
      metadata: {},
      sources: {},
      layers: [],
      sprite: 'https://tiles.mattech.vn/styles/basic/sprite',
      glyphs: 'https://tiles.mattech.vn/fonts/{fontstack}/{range}.pbf',
    };

    return Object.assign({}, defaultStyle, customStyle);
  }

  /**
   * Setup map event listeners
   *
   * @param map - Map instance
   * @param callbacks - Event callbacks
   * @returns Cleanup function to remove listeners
   */
  static setupMapEvents(
    map: MapSimple,
    callbacks: MapEventCallbacks,
  ): () => void {
    const cleanupFunctions: Array<() => void> = [];

    if (callbacks.onLoad) {
      map.once('load', () => {
        callbacks.onLoad?.(map);
      });
    }

    if (callbacks.onError) {
      const errorHandler = (e: { error?: Error }) => {
        const error = new MapEventError(
          `Map error: ${e.error?.message || 'Unknown error'}`,
          {
            context: { mapId: map.id },
            cause: e.error,
          },
        );
        callbacks.onError?.(error);
      };

      map.on('error', errorHandler);
      cleanupFunctions.push(() => {
        map.off('error', errorHandler);
      });
    }

    // Return cleanup function
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }

  /**
   * Cleanup map instance
   *
   * @param map - Map instance to cleanup
   */
  static cleanupMap(map: MapSimple): void {
    if (map && typeof map.remove === 'function') {
      map.remove();
    }
  }
}
