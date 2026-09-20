import type { LayerStyleType } from '../style/layer-simple-builder';

export type CreateControlLayerKind =
  | 'geojson'
  | 'filegdb'
  | 'xyz'
  | 'mbtiles'
  | 'pmtiles'
  | 'tilejson';

export type CreateControlSample = {
  id: string;
  label: string;
  layerKind: CreateControlLayerKind;
  config: Record<string, unknown>;
  dataUrl?: string;
};

export const VECTOR_SAMPLES: CreateControlSample[] = [
  {
    id: 'us-cities',
    label: 'US Cities',
    layerKind: 'geojson',
    dataUrl: 'https://data.source.coop/giswqs/opengeos/us_cities.geojson',
    config: { type: 'point' satisfies LayerStyleType },
  },
  {
    id: 'world-cities',
    label: 'World Cities',
    layerKind: 'geojson',
    dataUrl: 'https://data.source.coop/giswqs/opengeos/world_cities.geojson',
    config: { type: 'point' satisfies LayerStyleType },
  },
];

/** CreateControl samples for `xyz` vector templates. */
export const VECTOR_TILE_SAMPLES: CreateControlSample[] = [
  {
    id: 'maplibre-demotiles',
    label: 'MapLibre demo tiles',
    layerKind: 'xyz',
    dataUrl: 'https://demotiles.maplibre.org/tiles/{z}/{x}/{y}.pbf',
    config: {
      url: 'https://demotiles.maplibre.org/tiles/{z}/{x}/{y}.pbf',
      tiles: ['https://demotiles.maplibre.org/tiles/{z}/{x}/{y}.pbf'],
      minzoom: 0,
      maxzoom: 5,
      sourceLayer: 'countries',
      tileKind: 'vector',
      styleType: 'auto',
    },
  },
];

/** CreateControl samples for TileJSON vector sources. */
export const TILEJSON_SAMPLES: CreateControlSample[] = [
  {
    id: 'maplibre-demotiles-json',
    label: 'MapLibre demo TileJSON',
    layerKind: 'tilejson',
    dataUrl: 'https://demotiles.maplibre.org/tiles/tiles.json',
    config: {
      url: 'https://demotiles.maplibre.org/tiles/tiles.json',
    },
  },
];
