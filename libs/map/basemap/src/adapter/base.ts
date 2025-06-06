import { MapSimple } from '@hungpvq/shared-map';
import { getMap } from '@hungpvq/vue-map-core';
import { BaseMapLayer } from '../hooks/model';
import { BaseMapItem, IBaseMapLayer } from '../types';

export abstract class BaseMapAdapter {
  protected current?: BaseMapItem;
  protected layer?: IBaseMapLayer;

  public getCurrent(): BaseMapItem | undefined {
    return this.current;
  }

  public async setCurrent(mapId: string, baseMap: BaseMapItem) {
    this.current = baseMap;
    await this.onApplyBaseMap(mapId, baseMap);
  }

  public getIndexDefault(
    baseMaps: BaseMapItem[],
    defaultBaseMap: string,
  ): BaseMapItem | undefined {
    return (
      baseMaps.find((b) => b.default || b.title === defaultBaseMap) ??
      baseMaps[0]
    );
  }

  protected abstract onApplyBaseMap(
    mapId: string,
    baseMap: BaseMapItem,
  ): Promise<void>;
}

export class DefaultBaseMapAdapter extends BaseMapAdapter {
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
