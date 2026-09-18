import type { WithMapPropType } from '@hungpvq/map-core';
import type { MeasureActionItem } from '@hungpvq/map-core/measurement';

export interface MeasurementControlProps extends WithMapPropType {
  actions?: MeasureActionItem[];
}
