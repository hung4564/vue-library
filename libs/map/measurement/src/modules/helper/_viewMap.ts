import { getUUIDv4 } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/shared-map';
import {
  GeoJSONSource,
  GeoJSONSourceSpecification,
  LayerSpecification,
  SourceSpecification,
} from 'maplibre-gl';
import { IViewProps } from '../types';
import { View } from './_view';

export class MapView extends View {
  protected map: MapSimple;
  protected source!: {
    id: string;
    data: GeoJSONSourceSpecification;
  };
  protected layers: LayerSpecification[] = [];
  public onStart?: () => void;
  public onReset?: () => void;
  constructor(map: MapSimple) {
    super();
    this.map = map;
  }
  init(
    layers: (Pick<LayerSpecification, 'type'> & Record<string, any>)[],
    source: {
      id?: string;
      data: GeoJSONSourceSpecification;
    },
  ) {
    if (!source.id) {
      source.id = `measurment-control-${getUUIDv4()}`;
    }
    this.map.addSource(source.id, source.data);
    layers.forEach((layer) => {
      if (!layer.id) {
        layer.id = `measurment-control-${getUUIDv4()}`;
      }
      if (!layer.metadata) {
        layer.metadata = {};
      }
      layer.metadata['maplibregl-legend:disable'] = true;
      if (!layer.source) {
        layer.source = source.id;
      }
      this.map.addLayer(layer as LayerSpecification);
    });
    this.source = source as any;
    this.layers = layers as LayerSpecification[];
    return this;
  }
  start(_props?: IViewProps) {
    if (this.onStart) {
      this.onStart();
    }
    this.layers.forEach((layer) => {
      const layerId = layer.id;
      if (this.map.getLayer(layerId)) {
        this.map.moveLayer(layerId);
      }
    });
  }
  reset() {
    const source = this.map.getSource(this.source.id);
    if (source) {
      (source as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
    if (this.onReset) {
      this.onReset();
    }
  }
  destroy() {
    if (!this.map) return;
    this.layers.forEach((layer) => {
      const layerId = layer.id;
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    });
    if (this.map.getSource(this.source.id)) {
      this.map.removeSource(this.source.id);
    }
  }
  view(_props: IViewProps) {
    const { features, features_label = [] } = _props;
    const source = this.map.getSource(this.source.id);
    if (source) {
      const featureList = Array.isArray(features)
        ? features
        : features?.features || [];
      (source as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [...featureList, ...features_label],
      });
    }
  }
}
