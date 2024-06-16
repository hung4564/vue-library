import { type CoordinatesNumber } from '@hungpvq/shared-map';

export type IViewSetting = {
  coordinates?: CoordinatesNumber[];
  features?: any;
  value?: any;
  format?: any;
  features_label?: any;
  fields?: IViewSettingField[];
};
export type IViewSettingField = {
  trans?: string;
  text?: string;
  value?: any;
};
export interface IView {
  start: (_props?: any) => void;
  view: (_props: any) => void;
  reset: () => void;
  destroy: () => void;
}
