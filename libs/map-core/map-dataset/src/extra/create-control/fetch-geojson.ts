import type { GeoJSON } from 'geojson';
import { loadGisUrlAsync } from './geojson-worker.client';

export async function fetchGeojsonFromUrl(url: string): Promise<GeoJSON | null> {
  return (await loadGisUrlAsync(url)).geojson;
}
