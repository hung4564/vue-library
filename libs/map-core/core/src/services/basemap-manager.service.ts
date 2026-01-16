/**
 * Framework-agnostic basemap management service
 * Handles basemap operations, state management, and events
 */

import type { BaseMapItem, BaseMapStore, MittTypeBaseMap } from '../types';
import { MittTypeBaseMapEventKey } from '../types';
import { BaseMapAdapter } from '../adapter';
import { BasemapService } from './basemap.service';
import type { Emitter } from 'mitt';
import type { LoggerFunction } from '../store/interface';

/**
 * Basemap manager service
 * Provides framework-agnostic basemap management
 * Core is single source of truth for state
 */
export class BasemapManager {
  constructor(
    private mapId: string,
    private store: BaseMapStore,
    private adapter: BaseMapAdapter,
    private emitter: Emitter<MittTypeBaseMap>,
    private logger?: LoggerFunction,
  ) {}

  /**
   * Get current basemaps list
   * Core is single source of truth
   */
  getBaseMaps(): BaseMapItem[] {
    return this.store.baseMaps;
  }

  /**
   * Get current basemap
   * Core is single source of truth
   */
  getCurrent(): BaseMapItem | undefined {
    return this.store.current;
  }

  /**
   * Get default basemap ID
   */
  getDefaultBaseMapId(): string {
    return this.store.defaultBaseMap;
  }

  /**
   * Check if basemap is loading
   */
  isLoading(): boolean {
    return this.store.loading;
  }

  /**
   * Set basemaps list
   * Updates core state and emits event
   *
   * @param baseMaps - Array of basemap items
   */
  setBaseMaps(baseMaps: BaseMapItem[]): void {
    if (this.logger) {
      this.logger(this.mapId, 'debug', 'setBaseMaps', { baseMaps });
    }

    // Update core state (single source of truth)
    this.store.baseMaps = baseMaps;

    // Emit event for subscribers
    this.emitter.emit(MittTypeBaseMapEventKey.set, baseMaps);
  }

  /**
   * Set default basemap ID
   * Automatically sets current basemap if not set
   *
   * @param defaultBaseMap - Default basemap ID
   */
  setDefaultBaseMap(defaultBaseMap?: string): void {
    if (this.logger) {
      this.logger(this.mapId, 'debug', 'setDefaultBaseMap', { defaultBaseMap });
    }

    // Update core state
    this.store.defaultBaseMap = defaultBaseMap || '';

    // Get default basemap using service
    const baseMap = BasemapService.getDefaultBasemap(
      this.store.baseMaps,
      this.store.defaultBaseMap,
      this.adapter,
    );

    // Set current if not already set
    if (!this.store.current && baseMap) {
      this.setCurrent(baseMap);
    }
  }

  /**
   * Set current basemap
   * Updates core state, switches basemap, and emits events
   *
   * @param baseMap - Basemap item to set as current
   */
  async setCurrent(baseMap: BaseMapItem): Promise<void> {
    if (this.logger) {
      this.logger(this.mapId, 'debug', 'setCurrent', { baseMap });
    }

    // Prevent concurrent operations
    if (this.store.loading) {
      return;
    }

    try {
      // Update core state immediately
      this.store.current = baseMap;
      this.store.loading = true;

      // Emit current change event
      this.emitter.emit(MittTypeBaseMapEventKey.setCurrent, this.store.current);

      // Switch basemap using service
      await BasemapService.switchBasemap(this.mapId, this.adapter, baseMap);

      this.store.loading = false;
    } catch (error) {
      this.store.loading = false;
      throw error;
    }
  }

  /**
   * Initialize basemap manager
   * Sets default basemap and base maps list
   *
   * @param baseMaps - Array of basemap items
   * @param defaultBaseMap - Default basemap ID
   */
  init(baseMaps: BaseMapItem[], defaultBaseMap?: string): void {
    if (this.logger) {
      this.logger(this.mapId, 'debug', 'init', { baseMaps, defaultBaseMap });
    }

    this.setDefaultBaseMap(defaultBaseMap);
    this.setBaseMaps(baseMaps);
  }
}
