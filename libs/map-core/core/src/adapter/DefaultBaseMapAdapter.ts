/**
 * Framework-agnostic default adapter for basemap operations
 */

import type { BaseMapItem, IBaseMapLayer, MapSimple } from '../types';
import type { MapAccessor } from '../store';
import { BaseMapAdapter } from './BaseMapAdapter';
import { BaseMapLayer } from '../model/basemap';

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
