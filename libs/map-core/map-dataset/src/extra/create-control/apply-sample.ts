import { detectGeojsonCrs, detectGeojsonStyleType } from './geojson-parse';
import { fetchGeojsonFromUrl } from './fetch-geojson';
import type { CreateControlSample } from './presets';

export async function applyCreateControlSample(
  sample: CreateControlSample,
): Promise<Record<string, unknown>> {
  const config = { ...sample.config };

  if (!sample.dataUrl) {
    return config;
  }

  if (sample.dataFormat === 'parquet') {
    throw new Error('Parquet format is not supported yet');
  }

  const geojson = await fetchGeojsonFromUrl(sample.dataUrl);
  if (!geojson) {
    throw new Error('Invalid GeoJSON from sample URL');
  }

  config['geojson'] = geojson;
  if (!config['type']) {
    config['type'] = detectGeojsonStyleType(geojson);
  }
  const crs = detectGeojsonCrs(geojson);
  if (crs && !config['crs']) {
    config['crs'] = crs;
  }

  return config;
}
