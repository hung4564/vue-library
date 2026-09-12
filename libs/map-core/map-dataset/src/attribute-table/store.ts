import { isDataManagementView } from '../utils/check';
import { findSiblingOrNearestLeaf } from '../model/visitors';
import {
  buildAttributeTable,
  filterAttributeTableRows,
  type AttributeTableColumn,
  type AttributeTableColumnsOption,
  type AttributeTableRow,
} from './model';
import { resolveAttributeTableColumnsOption } from './dataset-part';
import {
  sortAttributeTableRows,
  type AttributeTableSortState,
} from './sort';
import { toFeatureCollection } from '../data-management/normalize';
import type { DataManagementPart } from '../data-management/types';
import { getDatasetFeatureCollection } from '../geo-export/dataset';
import type { IDataset } from '../interfaces';
import type { Feature, FeatureCollection } from 'geojson';

export const ATTRIBUTE_TABLE_DEFAULT_PAGE_SIZE = 50;

export const ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS = [
  { value: 25, text: '25' },
  { value: 50, text: '50' },
  { value: 100, text: '100' },
] as const;

/** `page` = browse table; `select` = resolve features by ids (cache separately). */
export type AttributeTableListIntent = 'page' | 'select';

export type AttributeTableStoreQuery = {
  intent: AttributeTableListIntent;
  page?: number;
  pageSize?: number | 'all';
  search?: string;
  sort?: AttributeTableSortState[];
  /** Required when intent === 'select' */
  ids?: string[];
};

export type AttributeTableStorePage = {
  columns: AttributeTableColumn[];
  rows: AttributeTableRow[];
  total: number;
};

/**
 * Attribute Table data source — `list` only.
 * Export UX is configured on the controller / shell (`export` prop), not here.
 */
export type AttributeTableStore = {
  list(query: AttributeTableStoreQuery): Promise<AttributeTableStorePage>;
  /**
   * Drop local caches so the next `list` reloads source data.
   * Optional — DM-backed stores usually no-op (already fetch each call).
   */
  invalidate?(): void;
};

export type CreateAttributeTableStoreOptions = {
  columns?: AttributeTableColumnsOption;
};

function featureMatchesId(feature: Feature, requested: Set<string>): boolean {
  if (feature.id != null && requested.has(String(feature.id))) return true;
  const props = feature.properties;
  if (props && typeof props === 'object' && props['id'] != null) {
    if (requested.has(String(props['id']))) return true;
  }
  return false;
}

function rowMatchesId(row: AttributeTableRow, requested: Set<string>): boolean {
  if (requested.has(row.id)) return true;
  if (featureMatchesId(row.feature, requested)) return true;
  const colon = row.id.indexOf(':');
  if (colon >= 0 && requested.has(row.id.slice(colon + 1))) return true;
  return false;
}

function normalizePageSize(
  pageSize: number | 'all' | undefined,
  fallback = ATTRIBUTE_TABLE_DEFAULT_PAGE_SIZE,
): number | 'all' {
  if (pageSize === 'all') return 'all';
  if (pageSize != null && Number(pageSize) > 0) return Number(pageSize);
  return fallback;
}

function isFeatureCollection(value: unknown): value is FeatureCollection {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as FeatureCollection).type === 'FeatureCollection'
  );
}

/**
 * In-memory GeoJSON store. `intent: 'page'` filters/sorts then slices;
 * `intent: 'select'` filters by ids (independent of page window).
 *
 * - Static `FeatureCollection` seed: caches rows until `invalidate()`.
 * - `IDataset` source: re-reads GeoJSON on every `list` (stays fresh after
 *   source / DM updates without closing the table).
 */
export function createLocalAttributeTableStore(
  source: IDataset | FeatureCollection,
  options: CreateAttributeTableStoreOptions = {},
): AttributeTableStore {
  const staticFc = isFeatureCollection(source) ? source : null;
  let cachedFc: FeatureCollection | null = staticFc;
  let cachedAllRows: AttributeTableRow[] | null = null;
  let cachedColumns: AttributeTableColumn[] | null = null;

  function clearCache() {
    if (!staticFc) cachedFc = null;
    cachedAllRows = null;
    cachedColumns = null;
  }

  async function ensureRows(): Promise<{
    columns: AttributeTableColumn[];
    rows: AttributeTableRow[];
  }> {
    if (!staticFc) {
      // Live dataset: always re-read so edits / redraw show up on next load.
      clearCache();
    } else if (cachedAllRows && cachedColumns) {
      return { columns: cachedColumns, rows: cachedAllRows };
    }

    let fc: FeatureCollection | null = cachedFc;
    if (!fc) {
      if (staticFc) {
        fc = staticFc;
      } else {
        fc = await getDatasetFeatureCollection(source as IDataset);
      }
      cachedFc = fc;
    }
    if (!fc) {
      return { columns: [], rows: [] };
    }
    const table = buildAttributeTable(fc, options.columns, { indexOffset: 0 });
    cachedColumns = table.columns;
    cachedAllRows = table.rows;
    return table;
  }

  return {
    invalidate: clearCache,
    async list(query) {
      const { columns, rows: allRows } = await ensureRows();
      if (query.intent === 'select') {
        const ids = (query.ids ?? []).map(String);
        const requested = new Set(ids);
        const rows = allRows.filter((row) => rowMatchesId(row, requested));
        return { columns, rows, total: rows.length };
      }

      let rows = filterAttributeTableRows(allRows, query.search ?? '');
      rows = sortAttributeTableRows(rows, query.sort ?? null);
      const total = rows.length;
      const pageSize = normalizePageSize(query.pageSize);
      if (pageSize === 'all') {
        return { columns, rows, total };
      }
      const page = query.page && query.page > 0 ? query.page : 1;
      const start = (page - 1) * pageSize;
      return {
        columns,
        rows: rows.slice(start, start + pageSize),
        total,
      };
    },
  };
}

/**
 * Wrap a data-management part: both page and select go through `part.list`.
 * Select maps `ids` → `PageQuery.filter.ids` (documented convention).
 * No row cache — each `list` hits the DM store.
 */
export function createDataManagementAttributeTableStore(
  part: DataManagementPart,
  options: CreateAttributeTableStoreOptions = {},
): AttributeTableStore {
  return {
    invalidate() {
      /* DM store is source of truth; nothing to cache here. */
    },
    async list(query) {
      if (query.intent === 'select') {
        const ids = (query.ids ?? []).map(String);
        const result = await part.list({
          page: 1,
          pageSize: 'all',
          filter: { ids },
        });
        const fc = toFeatureCollection(result.items ?? []);
        const table = buildAttributeTable(fc, options.columns, {
          indexOffset: 0,
        });
        const requested = new Set(ids);
        const rows = table.rows.filter((row) => rowMatchesId(row, requested));
        return { columns: table.columns, rows, total: rows.length };
      }

      const page = query.page && query.page > 0 ? query.page : 1;
      const pageSize = normalizePageSize(query.pageSize);
      const primarySort = query.sort?.[0];
      const result = await part.list({
        page,
        pageSize,
        search: query.search,
        sort: primarySort
          ? { field: primarySort.key, dir: primarySort.dir }
          : undefined,
      });
      const fc = toFeatureCollection(result.items ?? []);
      const table = buildAttributeTable(fc, options.columns, {
        indexOffset: (result.page - 1) * result.pageSize,
      });
      return {
        columns: table.columns,
        rows: table.rows,
        total: result.total,
      };
    },
  };
}

/** Default: DM sibling if present, otherwise local GeoJSON store. */
export function createAttributeTableStoreFromDataset(
  layer: IDataset,
  options: CreateAttributeTableStoreOptions = {},
): AttributeTableStore {
  const columns = resolveAttributeTableColumnsOption(layer, options.columns);
  const resolved: CreateAttributeTableStoreOptions = { ...options, columns };
  const management = findSiblingOrNearestLeaf(layer, isDataManagementView);
  if (management && isDataManagementView(management)) {
    return createDataManagementAttributeTableStore(management, resolved);
  }
  return createLocalAttributeTableStore(layer, resolved);
}
