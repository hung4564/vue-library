import type { CreateControlSample } from '../vector-tile/samples';

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
