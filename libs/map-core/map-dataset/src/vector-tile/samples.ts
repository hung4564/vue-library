import type { LayerStyleType } from '../style/layer-simple-builder';

export type CreateControlLayerKind = 'vector' | 'rasterxyz';

export type CreateControlSample = {
  id: string;
  label: string;
  layerKind: CreateControlLayerKind;
  config: Record<string, unknown>;
  dataUrl?: string;
  dataFormat?: 'geojson' | 'parquet';
};

export const VECTOR_SAMPLES: CreateControlSample[] = [
  {
    id: 'us-cities',
    label: 'US Cities',
    layerKind: 'vector',
    dataUrl: 'https://data.source.coop/giswqs/opengeos/us_cities.geojson',
    dataFormat: 'geojson',
    config: { type: 'point' satisfies LayerStyleType },
  },
  {
    id: 'world-cities',
    label: 'World Cities',
    layerKind: 'vector',
    dataUrl: 'https://data.source.coop/giswqs/opengeos/world_cities.geojson',
    dataFormat: 'geojson',
    config: { type: 'point' satisfies LayerStyleType },
  },
];
