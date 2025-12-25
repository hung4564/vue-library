import { type CoordinatesNumber } from '@hungpvq/shared-map';
import type { Feature, FeatureCollection } from 'geojson';

export type IViewSetting = {
  coordinates?: CoordinatesNumber[];
  features?: Feature[] | FeatureCollection;
  value?: number | string;
  format?: (value: number) => string;
  features_label?: Feature[];
  fields?: IViewSettingField[];
};
export type IViewSettingField = {
  trans?: string;
  text?: string;
  value?: number | string | boolean;
};
export interface IView {
  start: (_props?: any) => void;
  view: (_props: any) => void;
  reset: () => void;
  destroy: () => void;
}
