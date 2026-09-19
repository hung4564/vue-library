/**
 * Public entry for `@hungpvq/map-core/crs`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export {
  createCoordinateFormatter,
  createMapDisplayCoordinateFormatter,
} from './coordinate-formatter';
export {
  buildCrsSearchCatalog,
  buildMapCrsCatalog,
  enrichCrsItemProjection,
  formatCrsLabel,
  getCrsInputSuggestions,
  lookupCrsItem,
  normalizeDisplayEpsgs,
  normalizeEpsgCode,
  resolveCrsDisplayItems,
  resolveCrsItemForStore,
  resolveCrsProjection,
  searchCrsCatalog,
} from './crs-catalog';
export { CRS_CONTROL_LOCALE } from './locale';
export { logger } from './logger';
export { ensureMapCrsStore } from './register-domain-store';
export {
  createDefaultCrsStore,
  DEFAULT_CRS_ITEMS,
  INITIAL_MAP_CRS_ITEMS,
  MittTypeMapCrsEventKey,
} from './types';

export type { CoordinateFormatter } from './coordinate-formatter';
export type { CrsItem, MapCrsStore, MittTypeMapCrs } from './types';
