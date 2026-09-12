import {
  ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS,
  ATTRIBUTE_TABLE_ROW_HEIGHT,
  getVirtualRowWindow,
  resolveAttributeTableUi,
  type AttributeTableGridProps,
  type AttributeTablePagerProps,
  type AttributeTableToolbarProps,
  type AttributeTableViewProps,
} from '@hungpvq/map-dataset/attribute-table';
import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { RegistryItem } from '@hungpvq/react-map-core';
import { useEffect, useMemo, useState } from 'react';
import { AttributeTableGrid } from './AttributeTableGrid';
import { AttributeTablePager } from './AttributeTablePager';
import { AttributeTableToolbar } from './AttributeTableToolbar';

export function AttributeTableView(props: AttributeTableViewProps) {
  const [, setTick] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(320);
  const ui = resolveAttributeTableUi(props.ui);

  useEffect(() => {
    return props.controller.subscribe(() => setTick((v) => v + 1));
  }, [props.controller]);

  const state = props.controller.getState();
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

  const toolbarProps: AttributeTableToolbarProps = {
    mapId: props.mapId,
    query: state.search,
    searchPlaceholder: props.labels.search,
    zoomToSelection: state.zoomToSelection,
    zoomLabel: props.labels.zoomToSelection,
    rowFilter: state.rowFilter,
    filterItems: [
      { value: 'all', text: props.labels.showAll },
      { value: 'selected', text: props.labels.showSelected },
    ],
    clearLabel: props.labels.clear,
    clearDisabled: state.selectedIds.length === 0,
    exportLabel: state.exporting
      ? props.labels.exporting
      : state.selectedIds.length > 0
        ? props.labels.exportSelected
        : props.labels.export,
    exportDisabled: !props.controller.canExport() || state.exporting,
    exportLoading: state.exporting,
    ui,
    onQueryChange: (value) => props.controller.setSearch(value),
    onZoomToSelectionChange: (value) =>
      props.controller.setZoomToSelection(value),
    onRowFilterChange: (value) => props.controller.setRowFilter(value),
    onClearSelection: () => props.controller.clearSelection(),
    onExportClick: props.onExportClick,
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
    columns: state.columns,
    windowedRows,
    sortStates: state.sortStates,
    selectedIds: selectedSet,
    allVisibleSelected,
    checkbox: ui.checkbox,
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
    onSortColumn: (key, shiftKey) =>
      props.controller.toggleSort(key, shiftKey),
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
