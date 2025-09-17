import type { GeoJSONFeature } from 'maplibre-gl';
import type { IDataset } from '../../interfaces';

export type IHighlightConfig = {
  source?: string;
  'source-layer'?: string;
  filter?: any;
};
export type IHighlightView = IDataset & {
  highlight: (
    feature?: GeoJSONFeature,
  ) => Partial<IHighlightConfig> | undefined;
};
