import type { MapSimple } from '@hungpvq/shared-map';
import type { GeoJSONFeature } from 'maplibre-gl';
import type { WithDataHelper } from '../../extra';
import type { IDataset } from '../../interfaces';

export type IHighlightConfig = {
  source?: string;
  'source-layer'?: string;
  filter?: any;
};
export type ISimpleHighlightView = IDataset &
  WithDataHelper & {
    highlight: (
      feature?: GeoJSONFeature,
    ) => Partial<IHighlightConfig> | undefined;
  };
export type IComplexHighlightView = IDataset & WithDataHelper & HighlightHandle;
export type IHighlightView = ISimpleHighlightView | IComplexHighlightView;

export type HighlightHandle = {
  startAnimation(props: {
    map: MapSimple;
    feature?: GeoJSONFeature;
    durationMs?: number;
  }): void;
  stopAnimation(map: MapSimple): void;
  setOnDone(map: MapSimple, cb: () => void): void;
};
