/**
 * Public entry for `@hungpvq/map-dataset/create-control`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 * VECTOR/RASTER samples live on `@hungpvq/map-dataset/vector-tile` and `/raster`.
 */
export {
  clearCreateControlDraft,
  createControlDraftKey,
  loadCreateControlDraft,
  saveCreateControlDraft,
} from './draft';
export type { CreateControlDraft } from './draft';
export { applyCreateControlSample } from './apply-sample';
export { reportCreateLayerError } from './create-error';
export type { CreateLayerErrorContext } from './create-error';
export {
  CREATE_CONTROL_DEFAULT_DATA_TAB,
  getCreateControlDataTabs,
} from './data-tabs';
export type { CreateControlDataTab } from './data-tabs';
export {
  GIS_FILE_ACCEPT,
  ZIP_MEMBER_FORMATS,
  detectGisFormat,
  fileExtension,
  isBinaryGisFormat,
  isIgnoredZipEntry,
  isShapefileSidecar,
  isZipMemberFormat,
  sniffGisText,
} from './gis-format';
export type { GisFormat, GisSourceHint } from './gis-format';
export {
  asGisFeatureCollection,
  parseGisBuffer,
  parseGisFile,
  parseGisFiles,
  parseGisFromUrl,
  parseGisText,
  parseGisTextAsync,
} from './gis-parse';
export type { GisLoadResult, GisProgress } from './gis-parse';
export { CREATE_CONTROL_LOCALE, CREATE_CONTROL_SAMPLE_NONE } from './locale';
export {
  CREATE_CONTROL_MAX_FILE_BYTES,
  assertCreateControlFileSize,
  formatCreateControlBytes,
} from './limits';
export {
  buildCreateControlLoadedSource,
  shortenCreateControlUrl,
  summarizeCreateControlGeojson,
} from './loaded-source';
export type {
  CreateControlDataSourceKind,
  CreateControlGeoSummary,
  CreateControlLoadedSource,
} from './loaded-source';
export {
  SUGGESTED_LAYER_NAMES,
  applyCreateControlLayerName,
  getCreateControlSampleUrl,
  getCreateControlSamples,
  layerNameFromFileName,
  layerNameFromUrl,
  suggestLayerName,
} from './presets';
export type { CreateControlLayerKind, CreateControlSample } from './presets';
export {
  loadGisFileAsync,
  loadGisTextAsync,
  loadGisUrlAsync,
} from '../geojson/geojson-worker.client';
