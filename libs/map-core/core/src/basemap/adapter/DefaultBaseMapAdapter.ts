/**
 * Framework-agnostic default adapter for basemap operations
 */

import type { BaseMapItem, IBaseMapLayer } from '../types';

import type { MapSimple } from '../../types';
import type { MapAccessor } from '../../store';
import { BaseMapAdapter } from './BaseMapAdapter';
import { BaseMapLayer } from '../model/BaseMapLayer';

export class DefaultBaseMapAdapter extends BaseMapAdapter {
  protected layer?: IBaseMapLayer;

  constructor(private getMap: MapAccessor) {
    super();
  }

  protected async onApplyBaseMap(mapId: string, item: BaseMapItem) {
    if (!item) return;
    let layer = this.layer;
    if (layer) {
      this.getMap(mapId, (map: MapSimple) => {
        if (layer) {
          layer.removeFromMap(map);
        }
      });
    }
    if (!layer) {
      layer = new BaseMapLayer();
    }
    this.getMap(mapId, (map: MapSimple) => {
      layer.removeFromMap(map);
    });
    await layer.setBaseMap(item);
    this.getMap(mapId, (map: MapSimple) => {
      layer.addToMap(map, getLowestLayerId(map));
    });
    this.layer = layer;
  }
}

export function getLowestLayerId(map: MapSimple) {
  const layers = map.getStyle().layers;
  return layers.length > 0 ? layers[0].id : undefined;
}

/** Create a {@link DefaultBaseMapAdapter} with a fixed map accessor. */
export function createDefaultBaseMapAdapter(getMap: MapAccessor) {
  return new DefaultBaseMapAdapter(getMap);
}

/** Zero-arg constructor that produces {@link DefaultBaseMapAdapter} instances. */
export type DefaultBaseMapAdapterConstructor = new () => DefaultBaseMapAdapter;

/**
 * Returns a zero-arg constructor for adapter packages that inject `getMap` once
 * at module scope while keeping the public export name `DefaultBaseMapAdapter`.
 */
export function createDefaultBaseMapAdapterClass(
  getMap: MapAccessor,
): DefaultBaseMapAdapterConstructor {
  return class extends DefaultBaseMapAdapter {
    constructor() {
      super(getMap);
    }
  };
}
