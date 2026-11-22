/**
 * Public entry for `@hungpvq/map-dataset/vector-tile`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export type {
  VectorTileArchiveTileKind,
  VectorTileSourceLayerInfo,
} from './archives';
export {
  mbtilesLocalTilesUrl,
  metaFromMbtilesRows,
  parseVectorLayerInfosFromJson,
  parseVectorLayerInfosFromObject,
  pmtilesLocalTilesUrl,
  sourceLayerOptionsFromMeta,
} from './archives';
export type { VectorTileDatasetOption, VectorTileStyleMode } from './builder';
export { createVectorTileDataset } from './builder';
export type { CreateControlLayerKind, CreateControlSample } from './samples';
export {
  TILEJSON_SAMPLES,
  VECTOR_SAMPLES,
  VECTOR_TILE_SAMPLES,
} from './samples';
export { createDatasetPartVectorTileComponent } from './source';
export type {
  ConfigureVectorTileWorkerOptions,
  VectorTileArchiveKind,
  VectorTileArchiveMeta,
  VectorTileOpenResult,
} from './vectortile-worker.client';
export {
  closeVectorTileArchive,
  configureVectorTileWorker,
  ensureVectorTileProtocols,
  getVectorTileArchiveTile,
  openMbtilesArchive,
  openPmtilesFile,
  openPmtilesUrl,
  resolveVectorTileWorkerUrl,
} from './vectortile-worker.client';
