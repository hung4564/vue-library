import type { BBox, FeatureCollection, GeoJSON, Geometry } from 'geojson';

import { MapSimple } from '@hungpvq/shared-map';
import { AView, ISourceView } from '@hungpvq/vue-map-core';
import { AnySourceData } from 'mapbox-gl';

export abstract class ASource<IFeature = any>
  extends AView
  implements ISourceView
{
  bounds: BBox;
  constructor() {
    super();
    this.bounds = [-180, -85.051129, 180, 85.051129];
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
