import type { LayerStyleType } from '../../utils/layer-simple-builder';

export type CreateControlLayerKind = 'vector' | 'rasterxyz';

export type CreateControlSample = {
  id: string;
  label: string;
  layerKind: CreateControlLayerKind;
  config: Record<string, unknown>;
  /** Fetch vector data from this URL when the sample is applied. */
  dataUrl?: string;
  /** When set, sample cannot be loaded automatically (e.g. parquet). */
  dataFormat?: 'geojson' | 'parquet';
};

export const SUGGESTED_LAYER_NAMES: Record<CreateControlLayerKind, string> = {
  vector: 'Vector layer',
  rasterxyz: 'Raster XYZ layer',
};

export function suggestLayerName(layerKind: CreateControlLayerKind): string {
  return SUGGESTED_LAYER_NAMES[layerKind];
}

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

const USGS_XYZ =
  'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}';
const ESRI_XYZ =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const WORLD_BOUNDS = [-180, -85.051129, 180, 85.051129] as const;

export const RASTER_XYZ_SAMPLES: CreateControlSample[] = [
  {
    id: 'usgs-imagery',
    label: 'USGS Imagery',
    layerKind: 'rasterxyz',
    config: {
      url: USGS_XYZ,
      tiles: [USGS_XYZ],
      bounds: [...WORLD_BOUNDS],
      minzoom: 0,
      maxzoom: 19,
    },
  },
  {
    id: 'esri-world-imagery',
    label: 'Esri World Imagery',
    layerKind: 'rasterxyz',
    config: {
      url: ESRI_XYZ,
      tiles: [ESRI_XYZ],
      bounds: [...WORLD_BOUNDS],
      minzoom: 0,
      maxzoom: 19,
    },
  },
];

export function getCreateControlSamples(
  layerKind: CreateControlLayerKind,
): CreateControlSample[] {
  switch (layerKind) {
    case 'vector':
      return VECTOR_SAMPLES;
    case 'rasterxyz':
      return RASTER_XYZ_SAMPLES;
    default:
      return [];
  }
}

/** URL filled into the URL tab when a sample is selected. */
export function getCreateControlSampleUrl(
  sample: CreateControlSample,
): string {
  if (sample.dataUrl) return sample.dataUrl;
  const url = sample.config['url'];
  return typeof url === 'string' ? url : '';
}
