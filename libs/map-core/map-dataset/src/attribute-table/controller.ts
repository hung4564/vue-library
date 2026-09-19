import type { IDataset } from '../interfaces/dataset.base';
import type {
  AttributeTableColumnFilterMode,
  AttributeTableColumnFilters,
} from './filter';
import {
  resolveAttributeTableSelectedRowIds,
  type AttributeTableColumn,
  type AttributeTableColumnsOption,
  type AttributeTableRow,
} from './model';
import type { AttributeTableRowFilter } from './props';
import {
  toggleAttributeTableMultiSort,
  type AttributeTableSortState,
} from './sort';
import {
  ATTRIBUTE_TABLE_DEFAULT_PAGE_SIZE,
  createAttributeTableStoreFromDataset,
  type AttributeTableStore,
} from './store';

export type AttributeTableControllerReason =
  | 'initial'
  | 'reload'
  | 'page-change'
  | 'page-size'
  | 'search'
  | 'column-filter'
  | 'sort'
  | 'selection'
  | 'columns-visibility';

export type AttributeTableControllerEvent = {
  type: 'change';
  reason: AttributeTableControllerReason;
};

export type AttributeTableColumnFilterOptions = {
  mode?: AttributeTableColumnFilterMode;
  queryEnd?: string;
};

export type AttributeTableControllerState = {
  page: number;
  pageSize: number;
  total: number;
  loading: boolean;
  columns: AttributeTableColumn[];
  rows: AttributeTableRow[];
  search: string;
  /** Per-column filters (key → query string or entry with mode). */
  columnFilters: AttributeTableColumnFilters;
  /**
   * When set, View/Grid show only these column keys (order from `columns`).
   * `null` = show all.
   */
  visibleColumnKeys: string[] | null;
  sortStates: AttributeTableSortState[];
  selectedIds: string[];
  rowFilter: AttributeTableRowFilter;
  zoomToSelection: boolean;
};

export type AttributeTableController = {
  getState(): AttributeTableControllerState;
  getTotalPages(): number;
  canPrev(): boolean;
  canNext(): boolean;
  subscribe(listener: (event: AttributeTableControllerEvent) => void): () => void;
  load(reason?: AttributeTableControllerReason): Promise<void>;
  goPrev(): Promise<void>;
  goNext(): Promise<void>;
  setPageSize(pageSize: number | string): Promise<void>;
  setSearch(value: string): void;
  /**
   * Set or clear one column filter (`query` empty clears that key,
   * unless `number_between` with `queryEnd`).
   */
  setColumnFilter(
    key: string,
    query: string,
    options?: AttributeTableColumnFilterOptions,
  ): void;
  clearColumnFilters(): void;
  /** Restrict visible columns; `null` shows all. */
  setVisibleColumnKeys(keys: string[] | null): void;
  /** Clear visibility restriction (show every column). */
  showAllColumns(): void;
  toggleSort(key: string, append?: boolean): void;
  setRowFilter(value: AttributeTableRowFilter): void;
  setZoomToSelection(value: boolean): void;
  selectIds(ids: string[]): Promise<void>;
  toggleRow(row: AttributeTableRow): Promise<void>;
  toggleSelectAll(visibleRows: AttributeTableRow[]): Promise<void>;
  clearSelection(): void;
  resolveFeaturesForSelection(ids?: string[]): Promise<AttributeTableRow[]>;
  /** All rows matching current search/sort (pageSize `all`). */
  resolveFilteredFeatures(): Promise<AttributeTableRow[]>;
  dispose(): void;
};

export type CreateAttributeTableControllerOptions = {
  columns?: AttributeTableColumnsOption;
  pageSize?: number;
  rowFilter?: AttributeTableRowFilter;
  store?: AttributeTableStore;
  /**
   * When false, `toggleSort` is a no-op (from shell `ui.sort`).
   * Default true.
   */
  sortable?: boolean;
  /** Map id for log correlation (`attribute-table.load`). */
  mapId?: string;
};

/**
 * Framework-agnostic Attribute Table controller.
 * Page browse and selection resolve both go through `store.list` with an explicit `intent`.
 * Layer export lives on `@hungpvq/map-dataset/geo-export` (list ⋮ Export), not here.
 */
export function createAttributeTableController(
  layer: IDataset,
  options: CreateAttributeTableControllerOptions = {},
): AttributeTableController {
  let disposed = false;
  const store =
    options.store ??
    createAttributeTableStoreFromDataset(layer, { columns: options.columns });
  const tableSortable = options.sortable !== false;

  const state: AttributeTableControllerState = {
    page: 1,
    pageSize:
      options.pageSize && options.pageSize > 0
        ? options.pageSize
        : ATTRIBUTE_TABLE_DEFAULT_PAGE_SIZE,
    total: 0,
    loading: false,
    columns: [],
    rows: [],
    search: '',
    columnFilters: {},
    visibleColumnKeys: null,
    sortStates: [],
    selectedIds: [],
    rowFilter: options.rowFilter === 'selected' ? 'selected' : 'all',
    zoomToSelection: false,
  };

  const listeners = new Set<
    (event: AttributeTableControllerEvent) => void
  >();
  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  let columnFilterTimer: ReturnType<typeof setTimeout> | null = null;
  let loadSeq = 0;

  function notify(reason: AttributeTableControllerReason) {
    const event: AttributeTableControllerEvent = { type: 'change', reason };
    listeners.forEach((listener) => listener(event));
  }

  function getTotalPages() {
    return Math.max(1, Math.ceil((state.total || 0) / (state.pageSize || 1)));
  }

  function canPrev() {
    return state.page > 1 && !state.loading;
  }

  function canNext() {
    return state.page < getTotalPages() && !state.loading;
  }

  async function load(
    reason: AttributeTableControllerReason = 'reload',
  ): Promise<void> {
    if (disposed) return;
    const seq = ++loadSeq;
    // Keep rows visible while re-sorting / searching so header clicks feel instant.
    const quiet =
      reason === 'sort' ||
      reason === 'search' ||
      reason === 'column-filter';
    if (!quiet) {
      store.invalidate?.();
      state.loading = true;
      notify(reason);
    }
    try {
      const result = await store.list({
        intent: 'page',
        page: state.page,
        pageSize: state.pageSize,
        search: state.search,
        columnFilters: state.columnFilters,
        sort: state.sortStates,
      });
      if (disposed || seq !== loadSeq) return;
      state.columns = result.columns;
      state.rows = result.rows;
      state.total = result.total;
    } finally {
      state.loading = false;
      if (!disposed && seq === loadSeq) {
        notify(reason);
      }
    }
  }

  async function goPrev() {
    if (!canPrev()) return;
    state.page -= 1;
    state.selectedIds = [];
    await load('page-change');
  }

  async function goNext() {
    if (!canNext()) return;
    state.page += 1;
    state.selectedIds = [];
    await load('page-change');
  }

  async function setPageSize(value: number | string) {
    const next = Number(value);
    if (!Number.isFinite(next) || next <= 0 || next === state.pageSize) {
      return;
    }
    state.pageSize = next;
    state.page = 1;
    state.selectedIds = [];
    await load('page-size');
  }

  function setSearch(value: string) {
    state.search = value;
    notify('search');
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchTimer = null;
      if (disposed) return;
      state.page = 1;
      void load('search');
    }, 200);
  }

  function scheduleColumnFilterLoad() {
    notify('column-filter');
    if (columnFilterTimer) clearTimeout(columnFilterTimer);
    columnFilterTimer = setTimeout(() => {
      columnFilterTimer = null;
      if (disposed) return;
      state.page = 1;
      void load('column-filter');
    }, 200);
  }

  function setColumnFilter(
    key: string,
    query: string,
    options?: AttributeTableColumnFilterOptions,
  ) {
    const next = { ...state.columnFilters };
    const trimmed = query.trim();
    const queryEnd = options?.queryEnd?.trim() ?? '';
    const mode = options?.mode;
    const active =
      mode === 'number_between' ? !!(trimmed || queryEnd) : !!trimmed;
    if (!active) {
      delete next[key];
    } else if (mode || queryEnd) {
      next[key] = {
        query,
        ...(mode ? { mode } : {}),
        ...(queryEnd ? { queryEnd } : {}),
      };
    } else {
      next[key] = query;
    }
    state.columnFilters = next;
    scheduleColumnFilterLoad();
  }

  function clearColumnFilters() {
    if (!Object.keys(state.columnFilters).length) return;
    state.columnFilters = {};
    scheduleColumnFilterLoad();
  }

  function setVisibleColumnKeys(keys: string[] | null) {
    const next =
      keys == null
        ? null
        : Array.from(new Set(keys.map(String).filter(Boolean)));
    const prev = state.visibleColumnKeys;
    const same =
      (prev == null && next == null) ||
      (prev != null &&
        next != null &&
        prev.length === next.length &&
        prev.every((k, i) => k === next[i]));
    if (same) return;
    state.visibleColumnKeys = next;
    notify('columns-visibility');
  }

  function showAllColumns() {
    setVisibleColumnKeys(null);
  }

  function toggleSort(key: string, append = false) {
    if (!tableSortable) return;
    const column = state.columns.find((c) => c.key === key);
    if (column && column.sortable === false) return;
    state.sortStates = toggleAttributeTableMultiSort(
      state.sortStates,
      key,
      append,
    );
    state.page = 1;
    notify('sort');
    void load('sort');
  }

  function setRowFilter(value: AttributeTableRowFilter) {
    state.rowFilter = value;
    notify('selection');
  }

  function setZoomToSelection(value: boolean) {
    state.zoomToSelection = value;
    notify('selection');
  }

  async function resolveFeaturesForSelection(
    ids?: string[],
  ): Promise<AttributeTableRow[]> {
    const target = (ids ?? state.selectedIds).map(String);
    if (!target.length) return [];

    const requested = new Set(target);
    const fromPage = state.rows.filter((row) => requested.has(row.id));
    const have = new Set(fromPage.map((row) => row.id));
    const missing = target.filter((id) => !have.has(id));

    if (!missing.length) {
      const byId = new Map(fromPage.map((row) => [row.id, row]));
      return target
        .map((id) => byId.get(id))
        .filter((row): row is AttributeTableRow => !!row);
    }

    const result = await store.list({
      intent: 'select',
      ids: missing,
      pageSize: 'all',
    });
    const byId = new Map<string, AttributeTableRow>();
    for (const row of fromPage) byId.set(row.id, row);
    for (const row of result.rows) byId.set(row.id, row);

    const resolvedMissing = resolveAttributeTableSelectedRowIds(
      missing,
      result.rows,
    );
    for (const id of resolvedMissing) {
      const row = result.rows.find((r) => r.id === id);
      if (row) byId.set(id, row);
    }

    return target
      .map((id) => {
        if (byId.has(id)) return byId.get(id)!;
        return result.rows.find((r) => r.id === id || r.id.endsWith(`:${id}`));
      })
      .filter((row): row is AttributeTableRow => !!row);
  }

  async function resolveFilteredFeatures(): Promise<AttributeTableRow[]> {
    const result = await store.list({
      intent: 'page',
      page: 1,
      pageSize: 'all',
      search: state.search,
      columnFilters: state.columnFilters,
      sort: state.sortStates,
    });
    return result.rows;
  }

  async function selectIds(ids: string[]) {
    const next = resolveAttributeTableSelectedRowIds(ids, state.rows);
    const finalIds =
      next.length > 0 || ids.length === 0
        ? next
        : (await resolveFeaturesForSelection(ids)).map((r) => r.id);
    state.selectedIds = finalIds;
    if (finalIds.length > 0) {
      state.rowFilter = 'selected';
    }
    notify('selection');
  }

  async function toggleRow(row: AttributeTableRow) {
    const exists = state.selectedIds.includes(row.id);
    state.selectedIds = exists
      ? state.selectedIds.filter((id) => id !== row.id)
      : [...state.selectedIds, row.id];
    notify('selection');
  }

  async function toggleSelectAll(visibleRows: AttributeTableRow[]) {
    const allSelected =
      visibleRows.length > 0 &&
      visibleRows.every((row) => state.selectedIds.includes(row.id));
    if (allSelected) {
      const drop = new Set(visibleRows.map((row) => row.id));
      state.selectedIds = state.selectedIds.filter((id) => !drop.has(id));
    } else {
      state.selectedIds = Array.from(
        new Set([...state.selectedIds, ...visibleRows.map((row) => row.id)]),
      );
    }
    notify('selection');
  }

  function clearSelection() {
    state.selectedIds = [];
    notify('selection');
  }

  return {
    getState: () => ({
      ...state,
      columns: state.columns,
      rows: state.rows,
      columnFilters: { ...state.columnFilters },
      visibleColumnKeys:
        state.visibleColumnKeys == null
          ? null
          : state.visibleColumnKeys.slice(),
      sortStates: state.sortStates.slice(),
      selectedIds: state.selectedIds.slice(),
    }),
    getTotalPages,
    canPrev,
    canNext,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load,
    goPrev,
    goNext,
    setPageSize,
    setSearch,
    setColumnFilter,
    clearColumnFilters,
    setVisibleColumnKeys,
    showAllColumns,
    toggleSort,
    setRowFilter,
    setZoomToSelection,
    selectIds,
    toggleRow,
    toggleSelectAll,
    clearSelection,
    resolveFeaturesForSelection,
    resolveFilteredFeatures,
    dispose() {
      disposed = true;
      if (searchTimer) clearTimeout(searchTimer);
      if (columnFilterTimer) clearTimeout(columnFilterTimer);
      listeners.clear();
    },
  };
}
