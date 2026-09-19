/**
 * Abstract basemap adapter — map apply is implemented by subclasses.
 */

import type { BaseMapItem } from '../types';

export abstract class BaseMapAdapter {
  protected current?: BaseMapItem;

  public getCurrent(): BaseMapItem | undefined {
    return this.current;
  }

  public async setCurrent(mapId: string, baseMap: BaseMapItem): Promise<void> {
    this.current = baseMap;
    await this.onApplyBaseMap(mapId, baseMap);
  }

  /** Resolve default by id, then title, then `default` flag, then first item. */
  public getIndexDefault(
    baseMaps: BaseMapItem[],
    defaultBaseMap: string,
  ): BaseMapItem | undefined {
    if (defaultBaseMap) {
      const byId = baseMaps.find((b) => String(b.id) === defaultBaseMap);
      if (byId) return byId;
      const byTitle = baseMaps.find((b) => b.title === defaultBaseMap);
      if (byTitle) return byTitle;
    }
    return baseMaps.find((b) => b.default) ?? baseMaps[0];
  }

  protected abstract onApplyBaseMap(
    mapId: string,
    baseMap: BaseMapItem,
  ): Promise<void>;
}
