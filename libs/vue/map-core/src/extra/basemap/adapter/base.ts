import type { BaseMapItem, IBaseMapLayer, MapSimple } from '@hungpvq/map-core';
import { BaseMapAdapter, BaseMapLayer } from '@hungpvq/map-core';
import { getMap } from '../../../store/store';

// Re-export BaseMapAdapter from @hungpvq/map-core
export { BaseMapAdapter } from '@hungpvq/map-core';

export class DefaultBaseMapAdapter extends BaseMapAdapter {
  protected layer?: IBaseMapLayer;
  protected async onApplyBaseMap(mapId: string, item: BaseMapItem) {
    if (!item) return;
    let layer = this.layer;
    if (layer) {
      getMap(mapId, (map: MapSimple) => {
        if (layer) {
          layer.removeFromMap(map);
        }
      });
    }
    if (!layer) {
      layer = new BaseMapLayer();
    }
    getMap(mapId, (map: MapSimple) => {
      layer.removeFromMap(map);
    });
    await layer.setBaseMap(item);
    getMap(mapId, (map: MapSimple) => {
      layer.addToMap(map, getLowestLayerId(map));
    });
    this.layer = layer;
  }
}
function getLowestLayerId(map: MapSimple) {
  const layers = map.getStyle().layers;

  return layers.length > 0 ? layers[0].id : undefined;
}
