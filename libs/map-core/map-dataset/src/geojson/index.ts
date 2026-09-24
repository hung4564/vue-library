/**
 * Public entry for `@hungpvq/map-dataset/geojson`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export type {
  GeojsonDatasetOption,
  GeojsonLayerPart,
  GeojsonLayersDatasetOption,
} from './builder';
export {
  createGeoJsonDataset,
  createGeoJsonLayersDataset,
  splitGeojsonByGdbLayer,
} from './builder';
export { ensureGeojsonFeatureIds, GEOJSON_FEATURE_ID_KEY } from './feature-id';
export { fetchGeojsonFromUrl } from './fetch-geojson';
export { findGeojsonSource } from './find-source';
export type { GeojsonStyleMode } from './geojson-parse';
export {
  detectGeojsonCrs,
  detectGeojsonStyleType,
  detectGeojsonStyleTypes,
  GEOJSON_STYLE_AUTO,
  isGeojsonStyleAuto,
  isValidGeojson,
  parseGeojsonData,
  parseGeojsonText,
  shouldUseGisWorkerForGeojson,
  styleTypeToMapboxGeometryType,
} from './geojson-parse';
export type { ConfigureGisWorkerOptions } from './geojson-worker.client';
export {
  bboxFromGeojsonAsync,
  configureGisWorker,
  detectGeojsonStyleTypesAsync,
  loadGeojsonFileAsync,
  loadGeojsonTextAsync,
  parseGeojsonTextAsync,
  reprojectGeojsonAsync,
  reprojectGeojsonToWgs84Async,
  resolveGisWorkerUrl,
  terminateGeojsonWorker,
} from './geojson-worker.client';
export { createGeojsonHereDataset } from './here';
export { createDatasetPartGeojsonSourceComponent } from './source';
