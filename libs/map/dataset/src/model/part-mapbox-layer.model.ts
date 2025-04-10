import { MapSimple } from '@hungpvq/shared-map';
import { IMapboxLayerView } from '../interfaces/dataset.parts';
import { DatasetLeaf } from './dataset.base';
import { findFirstLeafByType } from './dataset.visitors';

export abstract class DatasetPartMapboxLayerComponent
  extends DatasetLeaf
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
}
export class MultiMapboxLayerComponent
  extends DatasetLeaf
  implements IMapboxLayerView
{
  constructor(name: string, data: any[]) {
    super(name, data);

    this.data.forEach((layer: any, id: number) => {
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
}
