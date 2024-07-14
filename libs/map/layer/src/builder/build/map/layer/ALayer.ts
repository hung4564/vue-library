import type { MapSimple } from '@hungpvq/shared-map';
import { AView, type ILayerMapView } from '@hungpvq/vue-map-core';

export interface IMapOption {
  metadata: {
    bounds?: number[];
  };
  id: string;
}

export abstract class AMapLayer<T extends IMapOption = IMapOption>
  extends AView
  implements ILayerMapView
{
  protected info: T;
  constructor(info: T) {
    super();
    this.info = Object.assign({ metadata: {} }, info);
  }
  get metadata() {
    return this.info ? this.info.metadata : {};
  }
  abstract getBeforeId(): string;
  abstract getAllLayerIds(): string[];
  abstract addToMap(map: MapSimple, beforeId: string): void;
  abstract removeFromMap(map: MapSimple): void;
  abstract moveLayer(map: MapSimple, beforeId: string): void;
  abstract toggleShow(map: MapSimple, show: boolean): void;
  abstract setOpacity(map: MapSimple, opacity: number): void;
  abstract getValue(): any;
  abstract getComponentUpdate(): any;
  abstract updateValue(map: MapSimple, value: any): void;
}
export interface IMapSingleLayerOption extends IMapOption {
  source: any;
  layer: any;
}
export interface IMapMultiLayerOption extends IMapOption {
  source: any;
  layers: any[];
}

export interface IMapOption {
  metadata: {
    bounds?: number[];
  };
  id: string;
}
