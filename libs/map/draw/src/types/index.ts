import type { Feature, GeoJSON, GeoJsonProperties, Geometry } from 'geojson';

// #region store
export type DrawSaveFcParams = {
  added: Record<string, Feature>;
  updated: Record<string, Feature>;
  deleted: Record<string, Feature>;
  geojson: GeoJSON;
};
export type DrawSaveFc = (params: DrawSaveFcParams) => void;
// #endregion store

export type MapDrawConfig = {
  drawSupports: string[];
  callback?: DrawSaveFc;
  cleanAfterDone: boolean;
};
export type MapDrawAction<P = any> = {
  addFeature: (
    feature: Feature<Geometry, P>,
    context: { mapId: string },
  ) => Promise<void | Feature | undefined>;
  updateFeature: (
    feature: Feature<Geometry, P>,
    context: { mapId: string },
  ) => Promise<void | Feature | undefined>;
  deleteFeature: (
    feature: Feature<Geometry, P>,
    context: { mapId: string },
  ) => Promise<void | Feature | undefined>;
  selectFeature: (
    props: { point: [number, number] },
    context: { mapId: string },
  ) => Promise<Feature<Geometry, P> | undefined>;
};
export type MapDrawOptionSimple<P = any> = MapDrawConfig &
  MapDrawAction<P> & {
    redraw: (mapId: string) => Promise<void> | void;
    cancel?: (item?: Feature<Geometry, P>) => Promise<any> | any;
  };
export type IDraftRecord<T = GeoJsonProperties> = {
  id: string | number;
  original?: Feature<Geometry, T>;
  modified?: Feature<Geometry, T>;
  status: 'created' | 'updated' | 'deleted';
};
export type MapDrawDraftOption = MapDrawOptionSimple & {
  draft: {
    show: boolean;
  };
  commit: () => Promise<void> | void;
  discard: (item?: IDraftRecord<any>) => Promise<void> | void;
  getDraftItems(): IDraftRecord<any>[];
};
export type MapDrawOption = MapDrawOptionSimple | MapDrawDraftOption;
export type MapDrawStore = {
  config?: MapDrawOption;
  state: {
    featuresAdded: Record<string, boolean>;
    featuresUpdated: Record<string, boolean>;
    featuresDeleted: Record<string, Feature>;
  };
};
export const MAP_DRAW_EVENT = {
  START: 'map:start',
  END: 'map:end',
} as const;
export type MapDrawEvent = {
  [MAP_DRAW_EVENT.START]: MapDrawOption;
  [MAP_DRAW_EVENT.END]: void;
};
