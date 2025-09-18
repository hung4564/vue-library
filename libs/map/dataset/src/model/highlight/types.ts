import type { MapSimple } from '@hungpvq/shared-map';
import type { GeoJSONFeature } from 'maplibre-gl';
import type { IDataset } from '../../interfaces';

export type IHighlightConfig = {
  source?: string;
  'source-layer'?: string;
  filter?: any;
};
export type ISimpleHighlightView = IDataset & {
  highlight: (
    feature?: GeoJSONFeature,
  ) => Partial<IHighlightConfig> | undefined;
};
export type IComplexHighlightView = IDataset & {
  handleHighlight: (
    map: MapSimple,
    feature: GeoJSONFeature,
    durationMs: number,
  ) => void;
  startAnimation(map: MapSimple, durationMs: number): void;
  stopAnimation(map: MapSimple): void;
};
export type IHighlightView = ISimpleHighlightView | IComplexHighlightView;
