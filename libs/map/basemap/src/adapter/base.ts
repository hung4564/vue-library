import { MapSimple } from '@hungpvq/shared-map';
import { store } from '@hungpvq/vue-map-core';
import { BaseMapLayer } from '../hooks/model';
import { BaseMapItem, IBaseMapLayer } from '../types';

export abstract class BaseMapAdapter {
  protected mapId: string;
  protected current?: BaseMapItem;
  protected layer?: IBaseMapLayer;

  constructor(mapId: string) {
    this.mapId = mapId;
  }

  public getCurrent(): BaseMapItem | undefined {
    return this.current;
  }

  public async setCurrent(baseMap: BaseMapItem) {
    this.current = baseMap;
    await this.onApplyBaseMap(this.mapId, baseMap);
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
      store.actions.getMap(mapId, (map: MapSimple) => {
        if (layer) {
          layer.removeFromMap(map);
        }
      });
    }
    if (!layer) {
      layer = new BaseMapLayer();
    }
    store.actions.getMap(mapId, (map: MapSimple) => {
      layer.removeFromMap(map);
    });
    await layer.setBaseMap(item);
    store.actions.getMap(mapId, (map: MapSimple) => {
      layer.addToMap(map, getLowestLayerId(map));
    });
    this.layer = layer;
  }
}
function getLowestLayerId(map: MapSimple) {
  const layers = map.getStyle().layers;

  return layers.length > 0 ? layers[0].id : undefined;
}
