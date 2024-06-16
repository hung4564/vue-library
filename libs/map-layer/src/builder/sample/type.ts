import { Color } from '@hungpv97/shared-map';
import type { IBuild, LayerAction } from '@hungpv97/vue-map-core';
import type { BBox, GeoJSON } from 'geojson';

export type OptionDefault = {
  builds?: IBuild[];
  actions?: LayerAction[];
};
export type OptionRasterTile = {
  name: string;
  tiles: string[];
  bounds?: BBox;
} & OptionDefault;
export type OptionRasterJson = {
  name: string;
  url: string;
} & OptionDefault;

export type OptionGeojson = {
  name: string;
  geojson: GeoJSON;
  type: string;
  color?: Color;
} & OptionDefault;
