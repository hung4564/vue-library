import { DEMO_LIST_BBOX } from './geojson';

export const ESRI_WORLD_IMAGERY_TILES = [
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
] as const;

export const ESRI_WORLD_IMAGERY_ATTRIBUTION = 'Tiles © Esri';

export const DEMO_RASTER_BBOX = DEMO_LIST_BBOX;

export function createRasterSourceConfig(bbox: [number, number, number, number] = DEMO_RASTER_BBOX) {
  return {
    type: 'raster' as const,
    tiles: [...ESRI_WORLD_IMAGERY_TILES],
    tileSize: 256,
    maxzoom: 19,
    attribution: ESRI_WORLD_IMAGERY_ATTRIBUTION,
    bounds: bbox,
  };
}
