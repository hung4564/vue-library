import { ILayer, IView } from '@hungpv97/vue-map-core';

import type {
  Feature,
  FeatureCollection,
  GeoJSON,
  GeoJsonProperties,
  Geometry,
} from 'geojson';
// #region store
export type DrawSaveFcParams = {
  added: Record<string, Feature>;
  updated: Record<string, Feature>;
  deleted: Record<string, Feature>;
  geojson: GeoJSON;
};
export type DrawSaveFc = (params: DrawSaveFcParams) => void;
export type MapDrawStore = {
  state: {
    activated: boolean;
    register_id?: string;
    show: boolean;
    draw_support: string[];
    cleanAfterDone: boolean;
  };
  control: any;
  callback?: DrawSaveFc;
  featuresAdded: Record<string, boolean>;
  featuresUpdated: Record<string, boolean>;
  featuresDeleted: Record<string, Feature>;
  action: {
    addFeatures?: (features: Feature[]) => Promise<boolean | void>;
    updateFeatures?: (features: Feature[]) => Promise<boolean | void>;
    deleteFeatures?: (features: Feature[]) => Promise<boolean | void>;
    getFeatures?: (point: [number, number]) => Promise<Feature[]>;
    reset?: () => Promise<boolean | void>;
    save?: (geojson?: GeoJSON) => Promise<boolean | void>;
    close?: () => void;
  };
};
// #endregion store

// #region draw
export type IDrawOption = {
  draw_support: string[];
  handler: IDrawHandler;
};

export type ILayerDrawView = IView & {
  draw_support: string[];
  handler: IDrawHandler;
};
export type IDrawHandler<IFeature = GeoJsonProperties> = {
  setLayer(layer: ILayer): void;
  updateLayer(layer: ILayer): void;
  setData(
    data?: FeatureCollection<Geometry, IFeature> | string | undefined
  ): void;
  getAll(): FeatureCollection<Geometry, IFeature> | undefined;
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

export type DrawOption = {
  draw_support: ILayerDrawView['draw_support'];
  addFeatures?: IDrawHandler['addFeatures'];
  getFeatures?: IDrawHandler['getFeatures'];
  updateFeatures?: IDrawHandler['updateFeatures'];
  deleteFeatures?: IDrawHandler['deleteFeatures'];
  reset?: () => Promise<void>;
  save?: (geojson?: GeoJSON) => Promise<void>;
  cleanAfterDone?: boolean;
};

// #endregion draw
