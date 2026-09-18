import type { AttributeTableRow } from './model';

/** How a column text filter matches cell display strings. */
export type AttributeTableColumnTextFilterMode = 'contains' | 'equals';

/**
 * Filter one column by cell text (display string in `row.cells`).
 * Empty / whitespace `query` matches every row for that column.
 */
export type AttributeTableColumnTextFilter = {
  key: string;
  query: string;
  /** Default `contains` (case-insensitive substring). */
  mode?: AttributeTableColumnTextFilterMode;
};

/**
 * Map of column key → query. Empty query values are ignored.
 * All entries are ANDed with mode `contains` unless overridden via
 * {@link filterAttributeTableRowsByColumnText} filter objects.
 */
export type AttributeTableColumnTextFilters = Record<string, string>;

export function matchAttributeTableColumnText(
  cell: string,
  query: string,
  mode: AttributeTableColumnTextFilterMode = 'contains',
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const hay = (cell ?? '').toLowerCase();
  if (mode === 'equals') return hay === needle;
  return hay.includes(needle);
}

function isColumnTextFilter(
  value: unknown,
): value is AttributeTableColumnTextFilter {
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
    | AttributeTableColumnTextFilter
    | AttributeTableColumnTextFilter[]
    | AttributeTableColumnTextFilters
    | null
    | undefined,
): AttributeTableColumnTextFilter[] {
  if (filters == null) return [];
  if (Array.isArray(filters)) {
    return filters.filter(
      (f): f is AttributeTableColumnTextFilter =>
        isColumnTextFilter(f) && String(f.query ?? '').trim() !== '',
    );
  }
  if (isColumnTextFilter(filters)) {
    return String(filters.query ?? '').trim() !== '' ? [filters] : [];
  }
  return Object.entries(filters)
    .filter(([, query]) => String(query ?? '').trim() !== '')
    .map(([key, query]) => ({
      key,
      query: String(query),
      mode: 'contains' as const,
    }));
}

/**
 * Keep rows whose cells match every column text filter (AND).
 * Global free-text search stays on {@link filterAttributeTableRows}.
 */
export function filterAttributeTableRowsByColumnText(
  rows: AttributeTableRow[],
  filters:
    | AttributeTableColumnTextFilter
    | AttributeTableColumnTextFilter[]
    | AttributeTableColumnTextFilters
    | null
    | undefined,
): AttributeTableRow[] {
  const list = normalizeFilters(filters);
  if (!list.length) return rows;
  return rows.filter((row) =>
    list.every((f) =>
      matchAttributeTableColumnText(
        row.cells[f.key] ?? '',
        f.query,
        f.mode ?? 'contains',
      ),
    ),
  );
}
