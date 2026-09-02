import type { GeoJSON } from 'geojson';
import { parseGeojsonTextAsync } from './geojson-worker.client';

export async function fetchGeojsonFromUrl(url: string): Promise<GeoJSON | null> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch GeoJSON (${res.status})`);
  }
  const text = await res.text();
  return parseGeojsonTextAsync(text);
}
