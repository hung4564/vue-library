import {
  ATTRIBUTE_TABLE_COLUMN_FILTER_MODES,
  ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS,
  ATTRIBUTE_TABLE_ROW_HEIGHT,
  type AttributeTableColumnFilterMode,
  type AttributeTableGridProps,
  type AttributeTablePagerProps,
  type AttributeTableToolbarProps,
  type AttributeTableViewProps,
  formatAttributeTableSelectionStatus,
  getAttributeTableColumnFilterMode,
  getAttributeTableColumnFilterQuery,
  getVirtualRowWindow,
  resolveAttributeTableUi,
  resolveAttributeTableVisibleColumns,
} from '@hungpvq/map-dataset/attribute-table';
import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { RegistryItem } from '@hungpvq/react-map-core';
import { useEffect, useMemo, useState } from 'react';

import { AttributeTableGrid } from './AttributeTableGrid';
import { AttributeTablePager } from './AttributeTablePager';
import { AttributeTableToolbar } from './AttributeTableToolbar';

function modeLabel(
  mode: AttributeTableColumnFilterMode,
  labels: AttributeTableViewProps['labels'],
): string {
  switch (mode) {
    case 'equals':
      return labels.columnFilterModeEquals;
    case 'number_eq':
      return labels.columnFilterModeNumberEq;
    case 'number_gte':
      return labels.columnFilterModeNumberGte;
    case 'number_lte':
      return labels.columnFilterModeNumberLte;
    case 'number_between':
      return labels.columnFilterModeNumberBetween;
    case 'date_eq':
      return labels.columnFilterModeDateEq;
    case 'date_gte':
      return labels.columnFilterModeDateGte;
    case 'date_lte':
      return labels.columnFilterModeDateLte;
    default:
      return labels.columnFilterModeContains;
  }
}

function queryPlaceholder(
  mode: AttributeTableColumnFilterMode,
  labels: AttributeTableViewProps['labels'],
): string {
  switch (mode) {
    case 'equals':
      return labels.columnFilterQueryEquals;
    case 'number_eq':
    case 'number_gte':
    case 'number_lte':
      return labels.columnFilterQueryNumber;
    case 'number_between':
      return labels.columnFilterQueryNumberBetween;
    case 'date_eq':
    case 'date_gte':
    case 'date_lte':
      return labels.columnFilterQueryDate;
    default:
      return labels.columnFilterQuery;
  }
}

export function AttributeTableView(props: AttributeTableViewProps) {
  const [, setTick] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(320);
  const [toolbarColumnKey, setToolbarColumnKey] = useState('');
  const [toolbarColumnMode, setToolbarColumnMode] =
    useState<AttributeTableColumnFilterMode>('contains');
  const ui = resolveAttributeTableUi(props.ui);

  useEffect(() => {
    return props.controller.subscribe(() => setTick((v) => v + 1));
  }, [props.controller]);

  const state = props.controller.getState();

  useEffect(() => {
    const keys = state.columns.map((c) => c.key);
    if (!keys.length) {
      setToolbarColumnKey('');
      return;
    }
    setToolbarColumnKey((prev) =>
      prev && keys.includes(prev) ? prev : (keys[0] ?? ''),
    );
  }, [state.columns]);

  useEffect(() => {
    if (!toolbarColumnKey) {
      setToolbarColumnMode('contains');
      return;
    }
    setToolbarColumnMode(
      getAttributeTableColumnFilterMode(state.columnFilters[toolbarColumnKey]),
    );
  }, [toolbarColumnKey, state.columnFilters]);

  const displayColumns = useMemo(
    () =>
      resolveAttributeTableVisibleColumns(
        state.columns,
        state.visibleColumnKeys,
      ),
    [state.columns, state.visibleColumnKeys],
  );

  const columnFilterQueries = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [key, entry] of Object.entries(state.columnFilters)) {
      out[key] = getAttributeTableColumnFilterQuery(entry);
    }
    return out;
  }, [state.columnFilters]);

  const visibleRows = useMemo(() => {
    if (state.rowFilter !== 'selected') return state.rows;
    const selected = new Set(state.selectedIds);
    return state.rows.filter((row) => selected.has(row.id));
  }, [state.rows, state.rowFilter, state.selectedIds]);

  const selectedSet = useMemo(
    () => new Set(state.selectedIds),
    [state.selectedIds],
  );
  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selectedSet.has(row.id));
  const virtualWindow = useMemo(
    () =>
      getVirtualRowWindow(
        visibleRows.length,
        scrollTop,
        viewportHeight || 320,
        ATTRIBUTE_TABLE_ROW_HEIGHT,
      ),
    [visibleRows.length, scrollTop, viewportHeight],
  );
  const windowedRows = useMemo(
    () => visibleRows.slice(virtualWindow.start, virtualWindow.end),
    [visibleRows, virtualWindow.start, virtualWindow.end],
  );
  const bottomSpacerHeight = Math.max(
    0,
    virtualWindow.totalHeight -
      virtualWindow.offsetY -
      windowedRows.length * ATTRIBUTE_TABLE_ROW_HEIGHT,
  );

  const tableLabel = props.layer?.getName?.() || props.labels.table;
  const selectionStatusText = formatAttributeTableSelectionStatus(
    props.labels.selectionStatus,
    state.selectedIds.length,
    state.total,
  );

  const columnFilterItems = state.columns.map((c) => ({
    value: c.key,
    text: c.label,
  }));
  const columnFilterModeItems = ATTRIBUTE_TABLE_COLUMN_FILTER_MODES.map(
    (mode) => ({
      value: mode,
      text: modeLabel(mode, props.labels),
    }),
  );

  function applyColumnFilter(
    key: string,
    query: string,
    mode: AttributeTableColumnFilterMode,
  ) {
    props.controller.setColumnFilter(key, query, { mode });
  }

  const toolbarProps: AttributeTableToolbarProps = {
    mapId: props.mapId,
    query: state.search,
    searchPlaceholder: props.labels.search,
    searchLabel: props.labels.search,
    zoomDisabled: state.selectedIds.length === 0,
    zoomLabel: props.labels.zoomToSelection,
    rowFilter: state.rowFilter,
    filterItems: [
      { value: 'all', text: props.labels.showAll },
      { value: 'selected', text: props.labels.showSelected },
    ],
    rowFilterLabel: props.labels.rowFilter,
    columnFilterItems,
    columnFilterKey: toolbarColumnKey,
    columnFilterQuery: getAttributeTableColumnFilterQuery(
      state.columnFilters[toolbarColumnKey],
    ),
    columnFilterLabel: props.labels.columnFilter,
    columnFilterQueryPlaceholder: queryPlaceholder(
      toolbarColumnMode,
      props.labels,
    ),
    clearColumnFilterLabel: props.labels.clearColumnFilter,
    columnFilterMode: toolbarColumnMode,
    columnFilterModeItems,
    columnFilterModeLabel: props.labels.columnFilterMode,
    columnVisibilityItems: columnFilterItems,
    visibleColumnKeys: state.visibleColumnKeys ?? [],
    columnVisibilityAll: state.visibleColumnKeys == null,
    columnVisibilityLabel: props.labels.columnsVisibility,
    columnsShowAllLabel: props.labels.columnsShowAll,
    clearLabel: props.labels.clear,
    clearDisabled: state.selectedIds.length === 0,
    exportLabel: props.labels.export,
    exportFormats: props.exportFormats,
    ui,
    onQueryChange: (value) => props.controller.setSearch(value),
    onZoomToSelection: () => props.onZoomToSelection?.(),
    onRowFilterChange: (value) => props.controller.setRowFilter(value),
    onColumnFilterKeyChange: setToolbarColumnKey,
    onColumnFilterQueryChange: (value) => {
      if (!toolbarColumnKey) return;
      applyColumnFilter(toolbarColumnKey, value, toolbarColumnMode);
    },
    onColumnFilterModeChange: (mode) => {
      const next = (
        ATTRIBUTE_TABLE_COLUMN_FILTER_MODES.includes(
          mode as AttributeTableColumnFilterMode,
        )
          ? mode
          : 'contains'
      ) as AttributeTableColumnFilterMode;
      setToolbarColumnMode(next);
      if (!toolbarColumnKey) return;
      const query = getAttributeTableColumnFilterQuery(
        state.columnFilters[toolbarColumnKey],
      );
      if (query.trim() || next === 'number_between') {
        applyColumnFilter(toolbarColumnKey, query, next);
      }
    },
    onClearColumnFilters: () => props.controller.clearColumnFilters(),
    onVisibleColumnKeysChange: (keys) =>
      props.controller.setVisibleColumnKeys(keys),
    onShowAllColumns: () => props.controller.showAllColumns(),
    onClearSelection: () => props.controller.clearSelection(),
    onExport: props.onExport,
    onExportFormat: props.onExportFormat,
  };

  const pagerProps: AttributeTablePagerProps = {
    mapId: props.mapId,
    page: state.page,
    totalPages: props.controller.getTotalPages(),
    pageSize: state.pageSize,
    total: state.total,
    loading: state.loading,
    canPrev: props.controller.canPrev(),
    canNext: props.controller.canNext(),
    onPrev: () => {
      void props.controller.goPrev();
    },
    onNext: () => {
      void props.controller.goNext();
    },
    onPageSizeChange: (size) => {
      void props.controller.setPageSize(size);
    },
    pageSizeItems: props.pageSizeItems.length
      ? props.pageSizeItems
      : [...ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS],
    pageLabel: props.labels.page,
    ofLabel: props.labels.of,
    prevLabel: props.labels.prev,
    nextLabel: props.labels.next,
    rowsPerPageLabel: props.labels.rowsPerPage,
  };

  const gridProps: AttributeTableGridProps = {
    mapId: props.mapId,
    loading: state.loading,
    empty: visibleRows.length === 0,
    loadingLabel: props.labels.loading,
    emptyLabel: props.labels.empty,
    tableLabel,
    gridRegionLabel: props.labels.gridRegion,
    selectAllLabel: props.labels.selectAll,
    selectRowLabel: props.labels.selectRow,
    actionsColumnLabel: props.labels.actionsColumn,
    sortedAscLabel: props.labels.sortedAsc,
    sortedDescLabel: props.labels.sortedDesc,
    notSortedLabel: props.labels.notSorted,
    columnFilterForLabel: props.labels.columnFilterFor,
    columns: displayColumns,
    windowedRows,
    sortStates: state.sortStates,
    columnFilters: columnFilterQueries,
    selectedIds: selectedSet,
    allVisibleSelected,
    checkbox: ui.checkbox,
    columnFilter: ui.columnFilter,
    sort: ui.sort,
    rowHeight: ATTRIBUTE_TABLE_ROW_HEIGHT,
    virtualWindow,
    bottomSpacerHeight,
    itemMenus: ui.rowMenus ? props.itemMenus : [],
    itemMenuHost: props.itemMenuHost,
    isMenuDisabled: props.isMenuDisabled,
    onScrollMetrics: (top, height) => {
      setScrollTop((prev) => (prev === top ? prev : top));
      setViewportHeight((prev) => (prev === height ? prev : height));
    },
    onSortColumn: (key, shiftKey) => props.controller.toggleSort(key, shiftKey),
    onColumnFilterChange: (key, query) => {
      const mode = getAttributeTableColumnFilterMode(state.columnFilters[key]);
      applyColumnFilter(key, query, mode);
    },
    onToggleSelectAll: () => {
      void props.controller.toggleSelectAll(visibleRows);
    },
    onToggleRow: (row) => {
      void props.controller.toggleRow(row);
    },
    onRowMenuAction: props.onRowMenuAction,
  };

  return (
    <div className="attribute-table">
      <div
        className="attribute-table__sr-only"
        role="status"
        aria-live="polite"
      >
        {selectionStatusText}
      </div>
      <RegistryItem
        componentKey={LIST_VIEW_MENU_COMPONENT_KEY.attributeTableToolbar}
        defaultComponent={AttributeTableToolbar}
        mapId={props.mapId}
        {...toolbarProps}
      />
      <div className="attribute-table__body">
        <RegistryItem
          componentKey={LIST_VIEW_MENU_COMPONENT_KEY.attributeTableGrid}
          defaultComponent={AttributeTableGrid}
          mapId={props.mapId}
          {...gridProps}
        />
      </div>
      {ui.pager ? (
        <RegistryItem
          componentKey={LIST_VIEW_MENU_COMPONENT_KEY.attributeTablePager}
          defaultComponent={AttributeTablePager}
          mapId={props.mapId}
          {...pagerProps}
        />
      ) : null}
    </div>
  );
}
