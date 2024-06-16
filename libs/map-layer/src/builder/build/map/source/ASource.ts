import type { BBox, FeatureCollection, GeoJSON, Geometry } from 'geojson';

import { MapSimple } from '@hungpv97/shared-map';
import { AView, type IView } from '@hungpv97/vue-map-core';
import { AnySourceData } from 'mapbox-gl';

export type ISource = IView & {
  getMapboxSource: () => object;
  updateForMap: (map: MapSimple) => void;
  addToMap: (map: MapSimple) => void;
  removeFromMap: (map: MapSimple) => void;
  bounds: BBox;
};
export abstract class ASource<IFeature = any> extends AView implements ISource {
  bounds: BBox;
  constructor() {
    super();
    this.bounds = [-180, -85.051129, 180, 85.051129];
    this.runAfterSetParent = () => {
      if (this.bounds && this.parent) {
        this.parent.metadata.bounds = this.bounds;
      }
    };
  }
  getAll(): FeatureCollection<Geometry, IFeature> | undefined {
    return undefined;
  }
  setData(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _?: FeatureCollection<Geometry, IFeature> | GeoJSON | string | undefined
  ) {
    return;
  }
  setBounds(bounds: BBox) {
    this.bounds = bounds;
    if (this.parent) {
      this.parent.metadata.bounds = bounds;
    }
  }
  addToMap(map: MapSimple) {
    if (this.id && !map.getSource(this.id)) {
      map.addSource(this.id, this.getMapboxSource());
    }
  }
  removeFromMap(map: MapSimple) {
    if (this.id && map.getSource(this.id)) {
      map.removeSource(this.id);
    }
  }
  abstract updateForMap(map: MapSimple): void;
  getMapboxSource(): AnySourceData {
    return {
      type: 'geojson',
    };
  }
}
