/**
 * Default MapLibre basemap adapter: swap a single prefixed layer under overlays.
 */

import type { MapSimple } from '../../types';
import type { MapAccessor } from '../../store';
import type { BaseMapItem, IBaseMapLayer } from '../types';
import { BASEMAP_PREFIX, BaseMapLayer } from '../model/BaseMapLayer';
import { BaseMapAdapter } from './BaseMapAdapter';

function awaitMap(getMap: MapAccessor, mapId: string): Promise<MapSimple> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (map: MapSimple) => {
      if (settled) return;
      settled = true;
      resolve(map);
    };
    const map = getMap(mapId, finish);
    if (map) finish(map);
  });
}

export class DefaultBaseMapAdapter extends BaseMapAdapter {
  protected layer?: IBaseMapLayer;

  constructor(private getMap: MapAccessor) {
    super();
  }

  protected async onApplyBaseMap(mapId: string, item: BaseMapItem) {
    if (!item) return;
    const map = await awaitMap(this.getMap, mapId);
    const layer = this.layer ?? new BaseMapLayer();
    layer.removeFromMap(map);
    await layer.setBaseMap(item);
    layer.addToMap(map, getLowestLayerId(map));
    this.layer = layer;
  }

  public override async setOpacity(
    mapId: string,
    opacity: number,
  ): Promise<void> {
    if (!this.layer) return;
    const map = await awaitMap(this.getMap, mapId);
    this.layer.setOpacity(map, opacity);
  }
}

/** First non-basemap style layer id (insert basemap before it). */
export function getLowestLayerId(map: MapSimple) {
  const layers = map.getStyle()?.layers ?? [];
  return layers.find((l) => !l.id.startsWith(BASEMAP_PREFIX))?.id;
}

export function createDefaultBaseMapAdapter(getMap: MapAccessor) {
  return new DefaultBaseMapAdapter(getMap);
}

export type DefaultBaseMapAdapterConstructor = new () => DefaultBaseMapAdapter;

/** Zero-arg class for Vue/React packages that inject `getMap` at module scope. */
export function createDefaultBaseMapAdapterClass(
  getMap: MapAccessor,
): DefaultBaseMapAdapterConstructor {
  return class extends DefaultBaseMapAdapter {
    constructor() {
      super(getMap);
    }
  };
}
