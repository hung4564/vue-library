import type { MapSimple } from '@hungpvq/map-core';
import type { WithDataHelper } from '../../extra';
import type { IDataset } from '../../interfaces';
import type { HighlightFilterCreator, HighlightGeoJson } from './helper';

export type IHighlightConfig = {
  source?: string;
  'source-layer'?: string;
  filter?: any;
};
export type ISimpleHighlightView = IDataset &
  WithDataHelper & {
    getFilterCreator?: () => HighlightFilterCreator | undefined;
  };
export type IComplexHighlightView = IDataset & WithDataHelper & HighlightHandle;
export type IHighlightView = ISimpleHighlightView | IComplexHighlightView;

export type HighlightHandle = {
  startAnimation(props: {
    map: MapSimple;
    feature?: HighlightGeoJson;
    durationMs?: number;
  }): void;
  stopAnimation(map: MapSimple): void;
  setOnDone(map: MapSimple, cb: () => void): void;
  getFilterCreator?: () => HighlightFilterCreator | undefined;
};
