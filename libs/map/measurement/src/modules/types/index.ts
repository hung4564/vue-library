import { type CoordinatesNumber } from '@hungpvq/shared-map';
import type { Feature, FeatureCollection } from 'geojson';

export type IViewSetting = {
  coordinates?: CoordinatesNumber[];
  features?: Feature[] | FeatureCollection;
  value?: number | string;
  format?: string | ((value: number) => string);
  features_label?: Feature[];
  fields?: IViewSettingField[];
  setting?: any;
};
export type IViewSettingField = {
  trans?: string;
  text?: string;
  value?: number | string | boolean;
};

export interface IViewProps extends IViewSetting {
  mapId: string;
}

export interface IView {
  start: (_props?: IViewProps) => void;
  view: (_props: IViewProps) => void;
  reset: () => void;
  destroy: () => void;
}
