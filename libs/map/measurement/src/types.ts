/**
 * Vue-specific measurement types
 * Framework-agnostic types are available directly from @hungpvq/map-core
 */

import type {
  CoordinatesNumber,
  MeasureActionItem as MeasureActionItemCore,
} from '@hungpvq/map-core';
import { MeasurementHandleType } from './modules/helper';

/**
 * Vue-specific MeasureActionItem type
 * Extends the core type with Vue-specific MeasurementHandleType
 */
export type MeasureActionItem = Omit<
  MeasureActionItemCore,
  'handle' | 'show'
> & {
  handle: (data: {
    handler: MeasurementHandleType;
    measurementType?: string;
    coordinates?: CoordinatesNumber[];
    clear: () => void;
    reset: () => void;
    onFlyTo: () => void;
  }) => void;
  show?: (data: {
    handler: MeasurementHandleType;
    measurementType?: string;
    status: 'select' | 'handle';
  }) => boolean;
};

// Re-export Vue-specific types from modules/types
export type { IView, IViewProps } from './modules/types';
