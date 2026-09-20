/**
 * Public entry for `@hungpvq/map-dataset/geojson`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export { createGeoJsonDataset, createGeoJsonLayersDataset, splitGeojsonByGdbLayer } from './builder';
export type {
  GeojsonDatasetOption,
  GeojsonLayerPart,
  GeojsonLayersDatasetOption,
} from './builder';
export { createGeojsonHereDataset } from './here';
export { createDatasetPartGeojsonSourceComponent } from './source';
export { findGeojsonSource } from './find-source';
export { fetchGeojsonFromUrl } from './fetch-geojson';
export {
  ensureGeojsonFeatureIds,
  GEOJSON_FEATURE_ID_KEY,
} from './feature-id';
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
  configureGisWorker,
  detectGeojsonStyleTypesAsync,
  loadGeojsonFileAsync,
  loadGeojsonTextAsync,
  parseGeojsonTextAsync,
  resolveGisWorkerUrl,
  reprojectGeojsonAsync,
  reprojectGeojsonToWgs84Async,
  terminateGeojsonWorker,
} from './geojson-worker.client';
export type { ConfigureGisWorkerOptions } from './geojson-worker.client';
