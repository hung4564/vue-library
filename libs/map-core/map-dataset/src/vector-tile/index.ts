/**
 * Public entry for `@hungpvq/map-dataset/vector-tile`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export { createVectorTileDataset } from './builder';
export type {
  VectorTileDatasetOption,
  VectorTileStyleMode,
} from './builder';
export { createDatasetPartVectorTileComponent } from './source';
export { VECTOR_SAMPLES, VECTOR_TILE_SAMPLES, TILEJSON_SAMPLES } from './samples';
export type { CreateControlLayerKind, CreateControlSample } from './samples';
export {
  metaFromMbtilesRows,
  mbtilesLocalTilesUrl,
  parseVectorLayerInfosFromJson,
  parseVectorLayerInfosFromObject,
  pmtilesLocalTilesUrl,
  sourceLayerOptionsFromMeta,
} from './archives';
export type {
  VectorTileArchiveTileKind,
  VectorTileSourceLayerInfo,
} from './archives';
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
export type {
  ConfigureVectorTileWorkerOptions,
  VectorTileArchiveKind,
  VectorTileArchiveMeta,
  VectorTileOpenResult,
} from './vectortile-worker.client';
