import type { IDataset } from '../interfaces';
import type { GeoExportFormat } from '../geo-export/types';
import {
  attributeTableRowsToFeatureCollection,
  exportAttributeTableRows,
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
import {
  isAttributeTableExportMenuMode,
  resolveAttributeTableExportActions,
  type AttributeTableExportContext,
  type AttributeTableExportOptions,
  type AttributeTableResolvedExportAction,
} from './export-options';
import { resolveAttributeTableExportOption } from './dataset-part';

export type AttributeTableControllerReason =
  | 'initial'
  | 'reload'
  | 'page-change'
  | 'page-size'
  | 'search'
  | 'sort'
  | 'selection'
  | 'export';

export type AttributeTableControllerEvent = {
  type: 'change';
  reason: AttributeTableControllerReason;
};

export type AttributeTableControllerState = {
  page: number;
  pageSize: number;
  total: number;
  loading: boolean;
  /** True while an export action / handler is in flight. */
  exporting: boolean;
  columns: AttributeTableColumn[];
  rows: AttributeTableRow[];
  search: string;
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
  toggleSort(key: string, append?: boolean): void;
  setRowFilter(value: AttributeTableRowFilter): void;
  setZoomToSelection(value: boolean): void;
  selectIds(ids: string[]): Promise<void>;
  toggleRow(row: AttributeTableRow): Promise<void>;
  toggleSelectAll(visibleRows: AttributeTableRow[]): Promise<void>;
  clearSelection(): void;
  resolveFeaturesForSelection(ids?: string[]): Promise<AttributeTableRow[]>;
  /** True when Export opens a submenu (not a single `onExport` handler). */
  isExportMenuMode(): boolean;
  /** Items for the default Export submenu. */
  getExportActions(): AttributeTableResolvedExportAction[];
  /** True when there is data and at least one export path. */
  canExport(): boolean;
  /**
   * Run export.
   * - Menu mode: pass action `id` (e.g. `format:geojson` or custom action id)
   * - Single-handler mode (`onExport`): call with no id (optional event)
   */
  export(
    actionId?: string,
    options?: { filename?: string; event?: MouseEvent },
  ): Promise<void>;
  dispose(): void;
};

export type CreateAttributeTableControllerOptions = {
  columns?: AttributeTableColumnsOption;
  pageSize?: number;
  rowFilter?: AttributeTableRowFilter;
  store?: AttributeTableStore;
  /** Customize Export button: formats submenu, custom actions, or one handler. */
  export?: AttributeTableExportOptions;
  /**
   * When false, `toggleSort` is a no-op (from shell `ui.sort`).
   * Default true.
   */
  sortable?: boolean;
};

/**
 * Framework-agnostic Attribute Table controller.
 * Page browse and selection resolve both go through `store.list` with an explicit `intent`.
 */
export function createAttributeTableController(
  layer: IDataset,
  options: CreateAttributeTableControllerOptions = {},
): AttributeTableController {
  let disposed = false;
  const store =
    options.store ??
    createAttributeTableStoreFromDataset(layer, { columns: options.columns });
  /** Part `export` wins over menu/shell when set. */
  const exportOptions = resolveAttributeTableExportOption(
    layer,
    options.export,
  );
  const tableSortable = options.sortable !== false;

  const state: AttributeTableControllerState = {
    page: 1,
    pageSize:
      options.pageSize && options.pageSize > 0
        ? options.pageSize
        : ATTRIBUTE_TABLE_DEFAULT_PAGE_SIZE,
    total: 0,
    loading: false,
    exporting: false,
    columns: [],
    rows: [],
    search: '',
    sortStates: [],
    selectedIds: [],
    rowFilter: options.rowFilter === 'selected' ? 'selected' : 'all',
    zoomToSelection: false,
  };

  const listeners = new Set<
    (event: AttributeTableControllerEvent) => void
  >();
  let searchTimer: ReturnType<typeof setTimeout> | null = null;
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
    const quiet = reason === 'sort' || reason === 'search';
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
      // Preserve call-order of ids where possible
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

    // Also match resolved aliases from resolveAttributeTableSelectedRowIds
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

  async function selectIds(ids: string[]) {
    const next = resolveAttributeTableSelectedRowIds(ids, state.rows);
    // If ids did not match current page, keep raw ids and try select-list resolve
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

  function isExportMenuMode() {
    return isAttributeTableExportMenuMode(exportOptions);
  }

  function getExportActions(): AttributeTableResolvedExportAction[] {
    return resolveAttributeTableExportActions(exportOptions);
  }

  function canExport() {
    if (state.exporting) return false;
    if (exportOptions?.onExport) {
      return state.selectedIds.length > 0 || state.total > 0;
    }
    if (!getExportActions().length) return false;
    return state.selectedIds.length > 0 || state.total > 0;
  }

  async function buildExportContext(
    filename: string,
    event?: MouseEvent,
  ): Promise<AttributeTableExportContext> {
    const ids = state.selectedIds.slice();
    const resolveRows = async () => {
      if (ids.length) return resolveFeaturesForSelection(ids);
      const page = await store.list({
        intent: 'page',
        page: 1,
        pageSize: 'all',
        search: state.search,
        sort: state.sortStates,
      });
      return page.rows;
    };
    return {
      layer,
      ids,
      search: state.search,
      sort: state.sortStates.slice(),
      filename,
      event,
      resolveRows,
      async downloadLocal(format, rows) {
        const list = rows ?? (await resolveRows());
        await exportAttributeTableRows(list, format, filename);
      },
      rowsToFeatureCollection: attributeTableRowsToFeatureCollection,
    };
  }

  async function exportAction(
    actionId?: string,
    runOptions: { filename?: string; event?: MouseEvent } = {},
  ): Promise<void> {
    if (disposed || state.exporting) return;
    if (!(state.selectedIds.length > 0 || state.total > 0)) return;

    const filename =
      runOptions.filename ?? `${layer.getName?.() || 'layer'}-table`;

    state.exporting = true;
    notify('export');
    try {
      const ctx = await buildExportContext(filename, runOptions.event);

      if (exportOptions?.onExport) {
        await exportOptions.onExport(ctx);
        return;
      }

      const actions = exportOptions?.actions ?? [];
      const resolved = getExportActions();
      const targetId =
        actionId ?? (resolved.length === 1 ? resolved[0]?.id : undefined);
      if (!targetId) return;

      const custom = actions.find((a) => a.id === targetId);
      if (custom?.run) {
        await custom.run(ctx);
        return;
      }

      const format: GeoExportFormat | undefined =
        custom?.format ??
        resolved.find((a) => a.id === targetId)?.format ??
        (targetId.startsWith('format:')
          ? (targetId.slice('format:'.length) as GeoExportFormat)
          : undefined);
      if (!format) return;
      await ctx.downloadLocal(format);
    } finally {
      state.exporting = false;
      if (!disposed) notify('export');
    }
  }

  return {
    getState: () => ({
      ...state,
      columns: state.columns,
      rows: state.rows,
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
    toggleSort,
    setRowFilter,
    setZoomToSelection,
    selectIds,
    toggleRow,
    toggleSelectAll,
    clearSelection,
    resolveFeaturesForSelection,
    isExportMenuMode,
    getExportActions,
    canExport,
    export: exportAction,
    dispose() {
      disposed = true;
      if (searchTimer) clearTimeout(searchTimer);
      listeners.clear();
    },
  };
}
