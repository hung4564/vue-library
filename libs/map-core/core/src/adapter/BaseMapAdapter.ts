/**
 * Framework-agnostic abstract adapter for basemap operations
 */

import type { BaseMapItem } from '../types';

/**
 * Abstract adapter class for basemap management
 * Framework-specific implementations should extend this class
 */
export abstract class BaseMapAdapter {
  protected current?: BaseMapItem;

  /**
   * Get the current basemap item
   *
   * @returns Current basemap item or undefined
   */
  public getCurrent(): BaseMapItem | undefined {
    return this.current;
  }

  /**
   * Set the current basemap
   * This method should be implemented by framework-specific adapters
   *
   * @param mapId - Map instance identifier
   * @param baseMap - Basemap item to set
   */
  public async setCurrent(mapId: string, baseMap: BaseMapItem): Promise<void> {
    this.current = baseMap;
    await this.onApplyBaseMap(mapId, baseMap);
  }

  /**
   * Get the default basemap from a list of basemaps
   *
   * @param baseMaps - Array of basemap items
   * @param defaultBaseMap - Default basemap identifier
   * @returns Default basemap item or first item in array
   */
  public getIndexDefault(
    baseMaps: BaseMapItem[],
    defaultBaseMap: string,
  ): BaseMapItem | undefined {
    return (
      baseMaps.find((b) => b.default || b.title === defaultBaseMap) ??
      baseMaps[0]
    );
  }

  /**
   * Abstract method to apply basemap
   * Must be implemented by framework-specific adapters
   *
   * @param mapId - Map instance identifier
   * @param baseMap - Basemap item to apply
   */
  protected abstract onApplyBaseMap(
    mapId: string,
    baseMap: BaseMapItem,
  ): Promise<void>;
}
