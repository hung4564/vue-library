import { copyByJson } from '@hungpvq/shared';
import { ILayer } from '@hungpvq/vue-map-core';
import booleanIntersects from '@turf/boolean-intersects';
import { point as pointTurf } from '@turf/turf';
import type { Feature, FeatureCollection } from 'geojson';
import { IDrawHandler } from '../../types';
export class GeojsonDataHandle implements IDrawHandler {
  public geojson: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };
  protected field_id = 'id';
  setLayer(layer: ILayer) {
    const geojson = (layer.getView('source') as any).geojson;
    this.setData(geojson);
  }
  updateLayer(layer: ILayer) {
    (layer.getView('source') as any).setData(this.geojson);
  }
  getAll() {
    return this.geojson;
  }
  setData(data?: FeatureCollection) {
    if (data) this.geojson = data;
  }
  async addFeatures(features: Feature[] = []) {
    this.geojson.features.push(
      ...features.map((x) => {
        delete x.id;
        return x;
      })
    );
    this.geojson = copyByJson(this.geojson);
  }
  async updateFeatures(features: Feature[] = []) {
    const object_cache = features.reduce<Record<string, Feature>>(
      (acc, cur) => {
        acc[cur.properties!.id] = cur;
        return acc;
      },
      {}
    );
    this.geojson.features.forEach((feature, i) => {
      if (object_cache[feature.properties!.id]) {
        this.geojson.features[i] = object_cache[feature.properties!.id];
      }
    });
  }
  async deleteFeatures(features: Feature[] = []) {
    const object_cache = features.reduce<Record<string, Feature>>(
      (acc, cur) => {
        acc[cur.properties!.id] = cur;
        return acc;
      },
      {}
    );
    this.geojson.features = this.geojson.features.filter(
      (x) => !object_cache[x.properties!.id]
    );
  }
  async getFeatures(point: [number, number]) {
    return this.geojson.features.filter((feature) =>
      booleanIntersects(feature, pointTurf(point))
    );
  }
}
