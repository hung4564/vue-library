/**
 * Public entry for `@hungpvq/map-dataset/geojson`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export { createGeoJsonDataset } from './builder';
export type { GeojsonDatasetOption } from './builder';
export { createGeojsonHereDataset } from './here';
export { createDatasetPartGeojsonSourceComponent } from './source';
export { findGeojsonSource } from './find-source';
export { fetchGeojsonFromUrl } from './fetch-geojson';
export {
  GEOJSON_STYLE_AUTO,
  detectGeojsonCrs,
  detectGeojsonStyleType,
  detectGeojsonStyleTypes,
  isGeojsonStyleAuto,
  isValidGeojson,
  parseGeojsonData,
  parseGeojsonText,
  shouldUseGisWorkerForGeojson,
  styleTypeToMapboxGeometryType,
} from './geojson-parse';
export type { GeojsonStyleMode } from './geojson-parse';
export {
  bboxFromGeojsonAsync,
  detectGeojsonStyleTypesAsync,
  loadGeojsonFileAsync,
  loadGeojsonTextAsync,
  parseGeojsonTextAsync,
  reprojectGeojsonToWgs84Async,
  terminateGeojsonWorker,
} from './geojson-worker.client';
