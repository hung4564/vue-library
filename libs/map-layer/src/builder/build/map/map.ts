import { MapSimple } from '@hungpvq/shared-map';
import {
  ABuild,
  AView,
  IBuild,
  ILayer,
  ILayerMapView,
  ISourceView,
  IView,
} from '@hungpvq/vue-map-core';
import { Layer as LayerMapbox } from 'mapbox-gl';
import { MapMultiLayer } from './layer';

export type IMapView = IView & {
  sourceView?: ISourceView;
  layerView?: ILayerMapView;
  getBeforeId(): string;
  getAllLayerIds(): string[];
  addToMap(map: MapSimple, beforeId: string): void;
  removeFromMap(map: MapSimple): void;
  moveLayer(map: MapSimple, beforeId: string): void;
  toggleShow(map: MapSimple, show: boolean): void;
  setOpacity(map: MapSimple, opacity: number): void;
  getValue(): any;
  getComponentUpdate(): any;
  updateValue(map: MapSimple, value: any): void;
};
type IMapViewOption = {
  layerView: ILayerMapView;
  sourceView?: ISourceView;
};
type LayerMapBuildOption = {
  layerBuild: IBuild<any, ILayerMapView>;
  sourceBuild: IBuild<any, ISourceView>;
  layer: {
    layers: Partial<LayerMapbox>[];
  };
  source?: any;
};
export class LayerMapBuild extends ABuild<LayerMapBuildOption, IMapView> {
  constructor() {
    super({
      layer: { layers: [] },
    });
    this.option.layerBuild = {
      key: 'layer',
      build(_layer: ILayer, option: any) {
        return new MapMultiLayer(option);
      },
    };
    this.setBuild((_layer: ILayer, option: LayerMapBuildOption) => {
      let sourceView: ISourceView | undefined = _layer.getView('source');
      if (option.sourceBuild && option.sourceBuild.build) {
        sourceView = option.sourceBuild.build(_layer, option.source);
        sourceView.setParent(_layer);
      }
      let layerView: ILayerMapView | undefined = undefined;
      if (option.layerBuild && option.layerBuild.build) {
        layerView = option.layerBuild.build(_layer, {
          source: { id: sourceView ? sourceView.id : undefined },
          ...option.layer,
        });
        layerView.setParent(_layer);
      }
      if (!layerView) {
        throw new Error('need set layer build');
      }
      const view = new MapView({ layerView, sourceView });
      return view;
    });
  }
  setLayers(layers: Omit<LayerMapbox, 'id'>[]) {
    if (!this.option.layer) {
      this.option.layer = { layers: [] };
    }
    this.option.layer.layers = layers;
    return this;
  }
  setLayer(layer: Omit<LayerMapbox, 'id'>) {
    if (!this.option.layer) {
      this.option.layer = { layers: [] };
    }
    this.option.layer.layers = [
      Object.assign({ layout: {}, paint: {} }, layer),
    ];
    return this;
  }
  setLayerBuild(layerBuild: IBuild<any, ILayerMapView>) {
    this.option.layerBuild = layerBuild;
    return this;
  }
  setSourceBuild(sourceBuild: IBuild<any, ISourceView>) {
    this.option.sourceBuild = sourceBuild;
    return this;
  }
}
class MapView extends AView implements IMapView {
  sourceView?: ISourceView;
  layerView: ILayerMapView;
  constructor(option: IMapViewOption) {
    super();
    this.layerView = option.layerView;
    this.sourceView = option.sourceView;
  }
  async addToMap(map: MapSimple, beforeId: string) {
    await this.sourceView?.addToMap(map);
    await this.layerView?.addToMap(map, beforeId);
  }
  async removeFromMap(map: MapSimple) {
    await this.layerView?.removeFromMap(map);
    await this.sourceView?.removeFromMap(map);
  }
  getBeforeId() {
    return this.layerView.getBeforeId();
  }
  getAllLayerIds() {
    return this.layerView.getAllLayerIds();
  }
  moveLayer(map: MapSimple, beforeId: string) {
    this.layerView.moveLayer(map, beforeId);
  }
  toggleShow(map: MapSimple, show: boolean) {
    this.layerView.toggleShow(map, show);
  }
  setOpacity(map: MapSimple, opacity: number) {
    this.layerView.setOpacity(map, opacity);
  }
  getComponentUpdate() {
    this.layerView.getComponentUpdate();
  }
  getValue() {
    return this.layerView.getValue();
  }
  updateValue(map: MapSimple, value: any) {
    this.layerView.updateValue(map, value);
  }
}
