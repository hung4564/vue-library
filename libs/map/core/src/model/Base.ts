import { getUUIDv4 } from '@hungpvq/shared';
import type { Feature, GeoJsonProperties, Geometry } from 'geojson';

export class Base {
  _id: string;
  get id() {
    return this._id;
  }
  constructor() {
    this._id = `${getUUIDv4()}`;
  }
}

export type IDrawHandler<IFeature = GeoJsonProperties> = {
  addFeatures?: (
    features: Feature<Geometry, IFeature>[]
  ) => Promise<boolean | void>;
  updateFeatures?: (
    features: Feature<Geometry, IFeature>[]
  ) => Promise<boolean | void>;
  deleteFeatures?: (
    features: Feature<Geometry, IFeature>[]
  ) => Promise<boolean | void>;
  getFeatures?: (point: [number, number]) => Promise<Feature[]>;
};
