import type { FeatureCollection } from 'geojson';
import type { IDataset } from '../interfaces';
import type { AttributeTableSortState } from '../attribute-table/sort';
import type { GeoExportFormat } from './types';

/** Which rows to export. */
export type GeoExportScope = 'all' | 'filtered' | 'selected';

/** How the Export entry presents choices. */
export type GeoExportUiMode = 'modal' | 'menu' | 'click';

/**
 * UniversalRegistry keys for Export UI overrides.
 * Prefer `registerComponent` / `registerComponentForMap`.
 */
export const GEO_EXPORT_COMPONENT_KEY = {
  /** Full ExportGeo modal shell. */
  root: 'layer-action-export-geo',
  /** Form body inside the modal (fields + actions). */
  form: 'layer-action-export-geo-form',
  /** Loading indicator override (busy state). */
  loading: 'layer-action-export-geo-loading',
  /** Format submenu inside LayerControl ⋮ when `uiMode: 'menu'`. */
  formatMenu: 'layer-action-export-geo-menu',
} as const;

export type GeoExportComponentKey =
  (typeof GEO_EXPORT_COMPONENT_KEY)[keyof typeof GEO_EXPORT_COMPONENT_KEY];

export type ExportGeoGetCollection = (
  layer: IDataset,
) =>
  | FeatureCollection
  | null
  | undefined
  | Promise<FeatureCollection | null | undefined>;

export type GeoExportHandler = (
  ctx: GeoExportContext,
) => void | Promise<void | Blob | null | undefined>;

/**
 * Config for dataset-part / menu / controller.
 * Local and server both use {@link onExport} (omit → built-in local pipeline).
 */
export type GeoExportOptions = {
  /**
   * - `modal` (default): opens ExportGeo shell
   * - `menu`: format submenu in the layer ⋮ menu
   * - `click`: one menu row; runs export immediately (`formats[0]` or `geojson`)
   */
  uiMode?: GeoExportUiMode;
  formats?: GeoExportFormat[];
  filename?: string | ((layer: IDataset) => string);
  getCollection?: ExportGeoGetCollection;
  sourceCrs?: string | null;
  targetCrs?: string | null;
  /** Scopes offered in the modal (default `['all']`). */
  scopes?: GeoExportScope[];
  defaultScope?: GeoExportScope;
  /**
   * Single export runner. Omit for built-in local (JS + worker + download).
   * Custom: call API and/or `ctx.downloadLocal(format)`.
   * Return a `Blob` to let the lib download it; `void` if you handle download.
   */
  onExport?: GeoExportHandler;
  /**
   * Local form body override (like AT `cellComponent`):
   * Registry `componentKey` (`string`) **or** a Vue/React component.
   * Wins over map-level `GEO_EXPORT_COMPONENT_KEY.form`.
   */
  formComponent?: unknown;
  /**
   * Local busy/loading override (like AT `cellComponent`):
   * Registry `componentKey` (`string`) **or** a Vue/React component.
   * Wins over map-level `GEO_EXPORT_COMPONENT_KEY.loading`.
   */
  loadingComponent?: unknown;
};

export type GeoExportContext = {
  layer: IDataset;
  mapId?: string;
  format: GeoExportFormat;
  filename: string;
  scope: GeoExportScope;
  ids: string[];
  search: string;
  sort: AttributeTableSortState[];
  sourceCrs: string;
  targetCrs: string;
  /**
   * Optional abort. Checked at run start, before/after resolve + download,
   * and after the handler returns. Custom `onExport` should also honor it.
   */
  signal?: AbortSignal;
  /** Resolve FeatureCollection for the current scope (DM / AT / GeoJSON). */
  resolveCollection: () => Promise<FeatureCollection | null>;
  /**
   * Built-in local convert + download for `format`
   * (uses collection from `resolveCollection` unless `collection` passed).
   */
  downloadLocal: (
    format?: GeoExportFormat,
    collection?: FeatureCollection | null,
  ) => Promise<void>;
};

export type GeoExportRunOptions = {
  format?: GeoExportFormat;
  filename?: string;
  scope?: GeoExportScope;
  sourceCrs?: string | null;
  targetCrs?: string | null;
  mapId?: string;
  signal?: AbortSignal;
};
