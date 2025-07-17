import { CoordinatesNumber } from '@hungpvq/shared-map';
import { MeasurementHandleType } from './modules/helper';

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
