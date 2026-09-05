/**
 * Framework-agnostic measurement types
 */

import type { Feature, FeatureCollection } from 'geojson';
import type { CoordinatesNumber } from './index';

/**
 * View setting for measurement results
 */
export type IViewSetting = {
  coordinates?: CoordinatesNumber[];
  features?: Feature[] | FeatureCollection;
  value?: number | string;
  format?: string | ((value: number) => string);
  features_label?: Feature[];
  fields?: IViewSettingField[];
  setting?: any;
};

/**
 * View setting field
 */
export type IViewSettingField = {
  trans?: string;
  text?: string;
  value?: number | string | boolean;
};

/**
 * View props passed to measurement views
 */
export interface IViewProps extends IViewSetting {
  mapId: string;
}

/**
 * Measurement view interface
 */
export interface IView {
  start: (_props?: IViewProps) => void;
  view: (_props: IViewProps) => void;
  reset: () => void;
  destroy: () => void;
}

/**
 * Measurement handler type
 */
export type MeasurementHandleType = {
  readonly type: string | null;
  readonly action: unknown;
  setAction: (action: unknown) => void;
  addView: (view: IView) => void;
  start: () => void;
  reset: () => void;
  destroy: () => void;
  add: (point: CoordinatesNumber) => void;
  init: (points?: CoordinatesNumber[]) => void;
  getResult: () => IViewProps;
  setMapId: (mapId: string) => void;
};

/**
 * Measurement action item
 * Used to define custom actions for measurement tools
 */
export type MeasureActionItem = {
  title: string;
  handle: (data: {
    handler: MeasurementHandleType;
    measurementType?: string;
    coordinates?: CoordinatesNumber[];
    clear: () => void;
    reset: () => void;
    onFlyTo: () => void;
  }) => void;
  icon: any;
  type: string;
  show?: (data: {
    handler: MeasurementHandleType;
    measurementType?: string;
    status: 'select' | 'handle';
  }) => boolean;
  isActive?: () => boolean;
  disabled?: (data: { coordinates?: CoordinatesNumber[] }) => boolean;
  index?: number;
};
