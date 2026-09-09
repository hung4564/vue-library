/**
 * Public entry for `@hungpvq/map-core/crs`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export {
  buildCrsSearchCatalog,
  buildMapCrsCatalog,
  formatCrsLabel,
  getCrsInputSuggestions,
  lookupCrsItem,
  normalizeEpsgCode,
  resolveCrsDisplayItems,
  resolveCrsItemForStore,
  resolveCrsProjection,
  searchCrsCatalog,
} from './crs-catalog';
export { CRS_CONTROL_LOCALE } from './locale';
export {
  createDefaultCrsStore,
  DEFAULT_CRS_ITEMS,
  INITIAL_MAP_CRS_ITEMS,
  MittTypeMapCrsEventKey,
} from './types';

export type { CrsItem, MapCrsStore, MittTypeMapCrs } from './types';
