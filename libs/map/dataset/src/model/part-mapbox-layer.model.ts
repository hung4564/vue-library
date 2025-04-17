import { copyByJson } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/shared-map';
import type { Layer } from 'mapbox-gl';
import type { IMapboxLayerView } from '../interfaces/dataset.parts';
import MultiStyle from '../modules/StyleControl/style/multi-style.vue';
import { DatasetLeaf } from './dataset.base';
import { findFirstLeafByType } from './dataset.visitors';

export abstract class DatasetPartMapboxLayerComponent<T = any>
  extends DatasetLeaf<T>
  implements IMapboxLayerView
{
  override get type(): string {
    return 'layer';
  }
  abstract getBeforeId(): string;
  abstract addToMap(map: MapSimple, beforeId?: string): void;
  abstract removeFromMap(map: MapSimple): void;
  abstract setOpacity(map: MapSimple, opacity: number): void;
  abstract toggleShow(map: MapSimple, show: boolean): void;
  abstract moveLayer(map: MapSimple, beforeId: string): void;
  abstract getAllLayerIds(): string[];
  abstract getComponentUpdate(): () => any;
  abstract updateValue(map: MapSimple, value: any): void;
}
export class MultiMapboxLayerComponent
  extends DatasetPartMapboxLayerComponent<Layer[]>
  implements IMapboxLayerView
{
  constructor(name: string, data: any[]) {
    super(name, data);

    (this.data || []).forEach((layer: any, id: number) => {
      if (!layer.id) {
        layer.id = `${this.id}-${id}`;
      }
    });
  }
  get layers() {
    return (this.data || []) as any[];
  }
  getBeforeId() {
    return this.layers[0].id;
  }
  getAllLayerIds() {
    return this.layers.map((x) => x.id);
  }
  addToMap(map: MapSimple, beforeId: string): void {
    const source = findFirstLeafByType(this, 'source');
    this.layers.forEach((layer) => {
      if (!map.getLayer(layer.id)) {
        if (!layer.source && source && source.id) {
          layer.source = source.id;
        }
        map.addLayer(layer, beforeId);
      }
    });
  }
  removeFromMap(map: MapSimple): void {
    this.layers.forEach((layer) => {
      if (map.getLayer(layer.id)) {
        map.removeLayer(layer.id);
      }
    });
  }

  moveLayer(map: MapSimple, beforeId: string): void {
    this.layers.forEach((layer) => {
      if (map.getLayer(layer.id)) {
        map.moveLayer(layer.id, beforeId);
      }
    });
  }

  toggleShow(map: MapSimple, show: boolean): void {
    this.layers.forEach((layer) => {
      if (map.getLayer(layer.id)) {
        map.setLayoutProperty(
          layer.id,
          'visibility',
          show ? 'visible' : 'none'
        );
      }
    });
  }
  setOpacity(map: MapSimple, opacity: number): void {
    this.layers.forEach((layer) => {
      if (map.getLayer(layer.id)) {
        const keyOpacity =
          layer.type == 'symbol' ? `icon-opacity` : `${layer.type}-opacity`;

        map.setPaintProperty(layer.id, keyOpacity, opacity);
      }
    });
  }
  getComponentUpdate() {
    return () => MultiStyle;
  }

  updateValue(
    map: MapSimple,
    value: { type: string; index: number; layer: any }
  ) {
    const { type, index } = value;
    let { layer } = value;
    switch (type) {
      case 'update-one-layer':
        updateStyleLayer(map, this.layers[index], layer);
        this.layers[index] = copyByJson(
          Object.assign({}, this.layers[index], layer)
        );
        break;
      case 'add-one-layer':
        layer = Object.assign(
          {},
          {
            id: `${this.id}-${this.layers.length}`,
            source: this.layers[0].source,
          },
          layer
        );
        map.addLayer(layer);
        this.layers.push(layer);
        break;
      case 'remove-one-layer':
        if (map.getLayer(layer.id)) map.removeLayer(layer.id);
        this.layers.splice(index, 1);

        break;

      default:
        break;
    }
  }
}

function updateStyleLayer(map: MapSimple, old: any, new_value: any) {
  map.setLayerZoomRange(
    old.id,
    new_value['min-zoom'] || old['min-zoom'] || 0,
    new_value['max-zoom'] || old['max-zoom'] || 24
  );
  for (const key in new_value.paint) {
    if (new_value.paint[key] !== old.paint[key]) {
      map.setPaintProperty(old.id, key, new_value.paint[key]);
    }
  }
  for (const key in new_value.layout) {
    if (new_value.layout[key] !== old.layout[key])
      map.setLayoutProperty(old.id, key, new_value.layout[key]);
  }
}
