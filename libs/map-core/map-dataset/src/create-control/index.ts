/**
 * Public entry for `@hungpvq/map-dataset/create-control`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 * VECTOR/RASTER samples live on `@hungpvq/map-dataset/vector-tile` and `/raster`.
 */
export {
  loadGisFileAsync,
  loadGisTextAsync,
  loadGisUrlAsync,
} from '../geojson/geojson-worker.client';
export { applyCreateControlSample } from './apply-sample';
export type { CreateLayerErrorContext } from './create-error';
export { reportCreateLayerError } from './create-error';
export { isCreateControlCrsMismatch } from './crs';
export type { CreateControlDataTab } from './data-tabs';
export {
  CREATE_CONTROL_DEFAULT_DATA_TAB,
  getCreateControlDataTabs,
} from './data-tabs';
export {
  collectFileGdbFilesFromDataTransfer,
  collectFilesFromDataTransfer,
  isGisUploadFileName,
  readClipboardGisPaste,
} from './data-transfer';
export type { CreateControlDraft } from './draft';
export {
  clearCreateControlDraft,
  createControlDraftKey,
  loadCreateControlDraft,
  saveCreateControlDraft,
} from './draft';
export { featuresWithGeometry } from './filegdb-meta';
export type { FileGdbGdalConfig } from './filegdb-parse';
export { configureFileGdbGdal } from './filegdb-parse';
export type {
  ArchiveCreateForm,
  FilegdbCreateForm,
  LayerFormHelper,
  LayerType,
  LayerTypeInput,
  LegacyLayerType,
  RasterCreateForm,
  SourceLayerOption,
  TileJsonCreateForm,
  VectorTileCreateForm,
  XyzCreateForm,
} from './form-create';
export {
  buildSourceLayerOptionMetaChips,
  ConfigFilegdbHelper,
  ConfigGeojsonHelper,
  ConfigHelper,
  ConfigMbtilesHelper,
  ConfigPmtilesHelper,
  ConfigRasterJsonHelper,
  ConfigTilejsonHelper,
  ConfigVectorTileHelper,
  ConfigXyzHelper,
  createLayerFormHelper,
  LAYER_TYPES,
  LayerHelper,
  looksVectorXyzUrl,
  normalizeLayerType,
  resolveCreateControlLayerTypes,
} from './form-create';
export type { GisFormat, GisSourceHint } from './gis-format';
export {
  detectGisFormat,
  fileExtension,
  FILEGDB_FILE_ACCEPT,
  GIS_FILE_ACCEPT,
  isBinaryGisFormat,
  isFileGdbPartName,
  isFileGdbZipName,
  isIgnoredZipEntry,
  isShapefileSidecar,
  isZipMemberFormat,
  looksLikeFileGdbFiles,
  sniffGisText,
  ZIP_MEMBER_FORMATS,
} from './gis-format';
export type { GisLoadResult, GisProgress } from './gis-parse';
export {
  asGisFeatureCollection,
  parseGisBuffer,
  parseGisFile,
  parseGisFiles,
  parseGisFromUrl,
  parseGisText,
  parseGisTextAsync,
} from './gis-parse';
export {
  assertCreateControlFileSize,
  CREATE_CONTROL_MAX_FILE_BYTES,
  formatCreateControlBytes,
} from './limits';
export type {
  CreateControlArchiveMetaInput,
  CreateControlDataSourceKind,
  CreateControlGeoSummary,
  CreateControlLoadedSource,
} from './loaded-source';
export {
  buildCreateControlArchiveMetaChips,
  buildCreateControlLoadedSource,
  shortenCreateControlUrl,
  summarizeCreateControlGeojson,
} from './loaded-source';
export { CREATE_CONTROL_LOCALE, CREATE_CONTROL_SAMPLE_NONE } from './locale';
export type { CreateControlLayerKind, CreateControlSample } from './presets';
export {
  applyCreateControlLayerName,
  getCreateControlSamples,
  getCreateControlSampleUrl,
  layerNameFromFileGdbFiles,
  layerNameFromFileName,
  layerNameFromUrl,
  SUGGESTED_LAYER_NAMES,
  suggestLayerName,
} from './presets';
export type {
  CreateControlFileParseResult,
  CreateControlPasteParseResult,
  CreateControlUploadFileSummary,
  CreateControlVectorUrlLoadResult,
} from './upload-helpers';
export {
  buildCreateControlLoadedMetaChips,
  createControlGeojsonPreviewPatch,
  createControlLoadedSourceEyebrowKey,
  findCreateControlSampleById,
  findCreateControlSampleMatchingUrl,
  formatCreateControlParseStatus,
  loadCreateControlTileJsonFromUrl,
  loadCreateControlVectorFromUrl,
  loadCreateControlVectorTileFromFile,
  loadCreateControlVectorTileFromUrl,
  looksCompleteGis,
  parseCreateControlPastedText,
  parseCreateControlUploadedFiles,
  resolveCreateControlSampleIdAfterUrlEdit,
  resolveCreateControlSampleSelection,
  subscribeCreateControlParseProgress,
  summarizeCreateControlUploadFiles,
  summarizeFileGdbLayerMeta,
  tileJsonToCreateControlPatch,
} from './upload-helpers';
