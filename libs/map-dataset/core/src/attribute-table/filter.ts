import type { AttributeTableRow } from './model';

/**
 * How a column filter matches cell display strings.
 * Text: `contains` / `equals`. Numeric / date modes parse the cell.
 */
export type AttributeTableColumnFilterMode =
  | 'contains'
  | 'equals'
  | 'number_eq'
  | 'number_gte'
  | 'number_lte'
  | 'number_between'
  | 'date_eq'
  | 'date_gte'
  | 'date_lte';

/** @deprecated Prefer {@link AttributeTableColumnFilterMode}. */
export type AttributeTableColumnTextFilterMode = AttributeTableColumnFilterMode;

/**
 * Filter one column by cell text / number / date (display string in `row.cells`).
 * Empty / whitespace `query` matches every row for that column
 * (except `number_between` when only `queryEnd` is set).
 */
export type AttributeTableColumnFilter = {
  key: string;
  query: string;
  /** Default `contains` (case-insensitive substring). */
  mode?: AttributeTableColumnFilterMode;
  /**
   * End of range for `number_between` when not encoded as `min..max` in `query`.
   */
  queryEnd?: string;
};

/** @deprecated Prefer {@link AttributeTableColumnFilter}. */
export type AttributeTableColumnTextFilter = AttributeTableColumnFilter;

/**
 * Map of column key → query string or filter entry.
 * Empty query values are ignored.
 * All entries are ANDed.
 */
export type AttributeTableColumnFilters = Record<
  string,
  string | Pick<AttributeTableColumnFilter, 'query' | 'mode' | 'queryEnd'>
>;

/** @deprecated Prefer {@link AttributeTableColumnFilters}. */
export type AttributeTableColumnTextFilters = AttributeTableColumnFilters;

export type AttributeTableColumnFilterEntry = Pick<
  AttributeTableColumnFilter,
  'query' | 'mode' | 'queryEnd'
>;

export const ATTRIBUTE_TABLE_COLUMN_FILTER_MODES: AttributeTableColumnFilterMode[] =
  [
    'contains',
    'equals',
    'number_eq',
    'number_gte',
    'number_lte',
    'number_between',
    'date_eq',
    'date_gte',
    'date_lte',
  ];

/** Read query string from a columnFilters map entry. */
export function getAttributeTableColumnFilterQuery(
  entry: AttributeTableColumnFilters[string] | undefined,
): string {
  if (entry == null) return '';
  return typeof entry === 'string' ? entry : String(entry.query ?? '');
}

/** Read mode from a columnFilters map entry (default contains). */
export function getAttributeTableColumnFilterMode(
  entry: AttributeTableColumnFilters[string] | undefined,
): AttributeTableColumnFilterMode {
  if (entry == null || typeof entry === 'string') return 'contains';
  return entry.mode ?? 'contains';
}

/** Read queryEnd from a columnFilters map entry. */
export function getAttributeTableColumnFilterQueryEnd(
  entry: AttributeTableColumnFilters[string] | undefined,
): string {
  if (entry == null || typeof entry === 'string') return '';
  return String(entry.queryEnd ?? '');
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function parseDate(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const t = Date.parse(trimmed);
  return Number.isFinite(t) ? t : null;
}

function parseBetweenBounds(
  query: string,
  queryEnd?: string,
): { min: number; max: number } | null {
  const endRaw = queryEnd?.trim() ?? '';
  if (endRaw) {
    const min = parseNumber(query);
    const max = parseNumber(endRaw);
    if (min == null || max == null) return null;
    return { min, max };
  }
  const parts = query.split('..');
  if (parts.length !== 2) return null;
  const min = parseNumber(parts[0] ?? '');
  const max = parseNumber(parts[1] ?? '');
  if (min == null || max == null) return null;
  return { min, max };
}

function isFilterActive(f: AttributeTableColumnFilter): boolean {
  const q = String(f.query ?? '').trim();
  const end = String(f.queryEnd ?? '').trim();
  if (f.mode === 'number_between') return !!(q || end);
  return !!q;
}

/**
 * Match a cell display string against a column filter.
 * Non-parseable cells fail numeric / date modes.
 */
export function matchAttributeTableColumnFilter(
  cell: string,
  query: string,
  mode: AttributeTableColumnFilterMode = 'contains',
  queryEnd?: string,
): boolean {
  const needle = query.trim();
  if (mode === 'number_between') {
    const bounds = parseBetweenBounds(query, queryEnd);
    if (!bounds) {
      // Empty / incomplete range → match all (same as empty text query).
      if (!needle && !String(queryEnd ?? '').trim()) return true;
      return false;
    }
    const cellNum = parseNumber(cell ?? '');
    if (cellNum == null) return false;
    return cellNum >= bounds.min && cellNum <= bounds.max;
  }

  if (!needle) return true;

  if (mode === 'contains' || mode === 'equals') {
    const hay = (cell ?? '').toLowerCase();
    const n = needle.toLowerCase();
    if (mode === 'equals') return hay === n;
    return hay.includes(n);
  }

  if (mode === 'number_eq' || mode === 'number_gte' || mode === 'number_lte') {
    const cellNum = parseNumber(cell ?? '');
    const qNum = parseNumber(needle);
    if (cellNum == null || qNum == null) return false;
    if (mode === 'number_eq') return cellNum === qNum;
    if (mode === 'number_gte') return cellNum >= qNum;
    return cellNum <= qNum;
  }

  // date_*
  const cellTime = parseDate(cell ?? '');
  const qTime = parseDate(needle);
  if (cellTime == null || qTime == null) return false;
  if (mode === 'date_eq') return cellTime === qTime;
  if (mode === 'date_gte') return cellTime >= qTime;
  return cellTime <= qTime;
}

/** @deprecated Prefer {@link matchAttributeTableColumnFilter}. */
export function matchAttributeTableColumnText(
  cell: string,
  query: string,
  mode: AttributeTableColumnFilterMode = 'contains',
): boolean {
  return matchAttributeTableColumnFilter(cell, query, mode);
}

function isColumnFilter(value: unknown): value is AttributeTableColumnFilter {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'key' in value &&
    'query' in value
  );
}

function normalizeFilters(
  filters:
    | AttributeTableColumnFilter
    | AttributeTableColumnFilter[]
    | AttributeTableColumnFilters
    | null
    | undefined,
): AttributeTableColumnFilter[] {
  if (filters == null) return [];
  if (Array.isArray(filters)) {
    return filters.filter(
      (f): f is AttributeTableColumnFilter =>
        isColumnFilter(f) && isFilterActive(f),
    );
  }
  if (isColumnFilter(filters)) {
    return isFilterActive(filters) ? [filters] : [];
  }
  return Object.entries(filters)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return {
          key,
          query: value,
          mode: 'contains' as const,
        };
      }
      return {
        key,
        query: String(value?.query ?? ''),
        mode: value?.mode ?? ('contains' as const),
        queryEnd: value?.queryEnd,
      };
    })
    .filter((f) => isFilterActive(f));
}

/**
 * Keep rows whose cells match every column filter (AND).
 * Global free-text search stays on {@link filterAttributeTableRows}.
 */
export function filterAttributeTableRowsByColumnText(
  rows: AttributeTableRow[],
  filters:
    | AttributeTableColumnFilter
    | AttributeTableColumnFilter[]
    | AttributeTableColumnFilters
    | null
    | undefined,
): AttributeTableRow[] {
  const list = normalizeFilters(filters);
  if (!list.length) return rows;
  return rows.filter((row) =>
    list.every((f) =>
      matchAttributeTableColumnFilter(
        row.cells[f.key] ?? '',
        f.query,
        f.mode ?? 'contains',
        f.queryEnd,
      ),
    ),
  );
}

/** Filter columns to `visibleKeys` (order preserved from `columns`). */
export function resolveAttributeTableVisibleColumns<T extends { key: string }>(
  columns: T[],
  visibleKeys: string[] | null | undefined,
): T[] {
  if (visibleKeys == null) return columns;
  const allowed = new Set(visibleKeys);
  return columns.filter((c) => allowed.has(c.key));
}
