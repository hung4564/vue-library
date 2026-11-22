import type { WithMapPropType } from '@hungpvq/map-core';
import type { MapDrawOption, MapDrawOptions } from '@hungpvq/map-draw';

export type DrawControlMapboxDrawControls = Omit<
  MapDrawOptions,
  'displayControlsDefault'
>;

export interface DrawControlProps extends WithMapPropType {
  drawOptions?: MapDrawOption;
  drawControlOptions?: DrawControlMapboxDrawControls;
}
