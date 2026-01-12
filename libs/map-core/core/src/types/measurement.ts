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
 * Measurement handler type
 * Framework-specific implementations should provide this type
 */
export type MeasurementHandleType = any;

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
