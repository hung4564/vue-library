<script lang="ts">
export default { name: 'attribute-table-view' };
</script>
<script setup lang="ts">
import {
  ATTRIBUTE_TABLE_COLUMN_FILTER_MODES,
  ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS,
  ATTRIBUTE_TABLE_ROW_HEIGHT,
  formatAttributeTableSelectionStatus,
  getAttributeTableColumnFilterMode,
  getAttributeTableColumnFilterQuery,
  getVirtualRowWindow,
  resolveAttributeTableUi,
  resolveAttributeTableVisibleColumns,
  type AttributeTableColumnFilterMode,
  type AttributeTableGridProps,
  type AttributeTablePagerProps,
  type AttributeTableToolbarProps,
  type AttributeTableViewProps,
} from '@hungpvq/map-dataset/attribute-table';
import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { RegistryItem } from '@hungpvq/vue-map-core';
import { computed, ref, watch } from 'vue';
import AttributeTableGrid from './AttributeTableGrid.vue';
import AttributeTablePager from './AttributeTablePager.vue';
import AttributeTableToolbar from './AttributeTableToolbar.vue';

const props = defineProps<AttributeTableViewProps>();
const ui = computed(() => resolveAttributeTableUi(props.ui));

const tick = ref(0);
watch(
  () => props.controller,
  (controller, _prev, onCleanup) => {
    tick.value += 1;
    const unsub = controller.subscribe(() => {
      tick.value += 1;
    });
    onCleanup(() => unsub());
  },
  { immediate: true },
);

const state = computed(() => {
  tick.value;
  return props.controller.getState();
});

const scrollTop = ref(0);
const viewportHeight = ref(320);
/** Toolbar column picker (which column the filter box edits). */
const toolbarColumnKey = ref('');
const toolbarColumnMode = ref<AttributeTableColumnFilterMode>('contains');

const filterItems = computed(() => [
  { value: 'all', text: props.labels.showAll },
  { value: 'selected', text: props.labels.showSelected },
]);

const columnFilterItems = computed(() =>
  state.value.columns.map((c) => ({ value: c.key, text: c.label })),
);

const columnFilterModeItems = computed(() =>
  ATTRIBUTE_TABLE_COLUMN_FILTER_MODES.map((mode) => ({
    value: mode,
    text: modeLabel(mode),
  })),
);

function modeLabel(mode: AttributeTableColumnFilterMode): string {
  const L = props.labels;
  switch (mode) {
    case 'equals':
      return L.columnFilterModeEquals;
    case 'number_eq':
      return L.columnFilterModeNumberEq;
    case 'number_gte':
      return L.columnFilterModeNumberGte;
    case 'number_lte':
      return L.columnFilterModeNumberLte;
    case 'number_between':
      return L.columnFilterModeNumberBetween;
    case 'date_eq':
      return L.columnFilterModeDateEq;
    case 'date_gte':
      return L.columnFilterModeDateGte;
    case 'date_lte':
      return L.columnFilterModeDateLte;
    default:
      return L.columnFilterModeContains;
  }
}

function queryPlaceholder(mode: AttributeTableColumnFilterMode): string {
  const L = props.labels;
  switch (mode) {
    case 'equals':
      return L.columnFilterQueryEquals;
    case 'number_eq':
    case 'number_gte':
    case 'number_lte':
      return L.columnFilterQueryNumber;
    case 'number_between':
      return L.columnFilterQueryNumberBetween;
    case 'date_eq':
    case 'date_gte':
    case 'date_lte':
      return L.columnFilterQueryDate;
    default:
      return L.columnFilterQuery;
  }
}

watch(
  () => state.value.columns.map((c) => c.key).join('\0'),
  () => {
    const keys = state.value.columns.map((c) => c.key);
    if (!keys.length) {
      toolbarColumnKey.value = '';
      return;
    }
    if (!toolbarColumnKey.value || !keys.includes(toolbarColumnKey.value)) {
      toolbarColumnKey.value = keys[0] ?? '';
    }
  },
  { immediate: true },
);

watch(
  () => [
    toolbarColumnKey.value,
    state.value.columnFilters[toolbarColumnKey.value],
  ] as const,
  () => {
    const key = toolbarColumnKey.value;
    if (!key) {
      toolbarColumnMode.value = 'contains';
      return;
    }
    toolbarColumnMode.value = getAttributeTableColumnFilterMode(
      state.value.columnFilters[key],
    );
  },
);

const displayColumns = computed(() =>
  resolveAttributeTableVisibleColumns(
    state.value.columns,
    state.value.visibleColumnKeys,
  ),
);

const columnFilterQueries = computed(() => {
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(state.value.columnFilters)) {
    out[key] = getAttributeTableColumnFilterQuery(entry);
  }
  return out;
});

const visibleRows = computed(() => {
  const rows = state.value.rows;
  if (state.value.rowFilter !== 'selected') return rows;
  const selected = new Set(state.value.selectedIds);
  return rows.filter((row) => selected.has(row.id));
});
const selectedSet = computed(() => new Set(state.value.selectedIds));
const allVisibleSelected = computed(
  () =>
    visibleRows.value.length > 0 &&
    visibleRows.value.every((row) => selectedSet.value.has(row.id)),
);
const virtualWindow = computed(() =>
  getVirtualRowWindow(
    visibleRows.value.length,
    scrollTop.value,
    viewportHeight.value || 320,
    ATTRIBUTE_TABLE_ROW_HEIGHT,
  ),
);
const windowedRows = computed(() =>
  visibleRows.value.slice(virtualWindow.value.start, virtualWindow.value.end),
);
const bottomSpacerHeight = computed(() =>
  Math.max(
    0,
    virtualWindow.value.totalHeight -
      virtualWindow.value.offsetY -
      windowedRows.value.length * ATTRIBUTE_TABLE_ROW_HEIGHT,
  ),
);

const tableLabel = computed(
  () => props.layer?.getName?.() || props.labels.table,
);

const selectionStatusText = computed(() =>
  formatAttributeTableSelectionStatus(
    props.labels.selectionStatus,
    state.value.selectedIds.length,
    state.value.total,
  ),
);

function applyColumnFilter(key: string, query: string, mode: AttributeTableColumnFilterMode) {
  props.controller.setColumnFilter(key, query, { mode });
}

const toolbarProps = computed(
  (): AttributeTableToolbarProps => ({
    mapId: props.mapId,
    query: state.value.search,
    searchPlaceholder: props.labels.search,
    searchLabel: props.labels.search,
    zoomDisabled: state.value.selectedIds.length === 0,
    zoomLabel: props.labels.zoomToSelection,
    rowFilter: state.value.rowFilter,
    filterItems: filterItems.value,
    rowFilterLabel: props.labels.rowFilter,
    columnFilterItems: columnFilterItems.value,
    columnFilterKey: toolbarColumnKey.value,
    columnFilterQuery: getAttributeTableColumnFilterQuery(
      state.value.columnFilters[toolbarColumnKey.value],
    ),
    columnFilterLabel: props.labels.columnFilter,
    columnFilterQueryPlaceholder: queryPlaceholder(toolbarColumnMode.value),
    clearColumnFilterLabel: props.labels.clearColumnFilter,
    columnFilterMode: toolbarColumnMode.value,
    columnFilterModeItems: columnFilterModeItems.value,
    columnFilterModeLabel: props.labels.columnFilterMode,
    columnVisibilityItems: columnFilterItems.value,
    visibleColumnKeys: state.value.visibleColumnKeys ?? [],
    columnVisibilityAll: state.value.visibleColumnKeys == null,
    columnVisibilityLabel: props.labels.columnsVisibility,
    columnsShowAllLabel: props.labels.columnsShowAll,
    clearLabel: props.labels.clear,
    clearDisabled: state.value.selectedIds.length === 0,
    exportLabel: props.labels.export,
    exportFormats: props.exportFormats,
    ui: ui.value,
    onQueryChange: (value) => props.controller.setSearch(value),
    onZoomToSelection: () => props.onZoomToSelection?.(),
    onRowFilterChange: (value) => props.controller.setRowFilter(value),
    onColumnFilterKeyChange: (key) => {
      toolbarColumnKey.value = key;
    },
    onColumnFilterQueryChange: (value) => {
      const key = toolbarColumnKey.value;
      if (!key) return;
      applyColumnFilter(key, value, toolbarColumnMode.value);
    },
    onColumnFilterModeChange: (mode) => {
      const next = (ATTRIBUTE_TABLE_COLUMN_FILTER_MODES.includes(
        mode as AttributeTableColumnFilterMode,
      )
        ? mode
        : 'contains') as AttributeTableColumnFilterMode;
      toolbarColumnMode.value = next;
      const key = toolbarColumnKey.value;
      if (!key) return;
      const query = getAttributeTableColumnFilterQuery(
        state.value.columnFilters[key],
      );
      if (query.trim() || next === 'number_between') {
        applyColumnFilter(key, query, next);
      }
    },
    onClearColumnFilters: () => props.controller.clearColumnFilters(),
    onVisibleColumnKeysChange: (keys) =>
      props.controller.setVisibleColumnKeys(keys),
    onShowAllColumns: () => props.controller.showAllColumns(),
    onClearSelection: () => props.controller.clearSelection(),
    onExport: props.onExport,
    onExportFormat: props.onExportFormat,
  }),
);

const pagerProps = computed(
  (): AttributeTablePagerProps => ({
    mapId: props.mapId,
    page: state.value.page,
    totalPages: props.controller.getTotalPages(),
    pageSize: state.value.pageSize,
    total: state.value.total,
    loading: state.value.loading,
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
  }),
);

const gridProps = computed(
  (): AttributeTableGridProps => ({
    mapId: props.mapId,
    loading: state.value.loading,
    empty: visibleRows.value.length === 0,
    loadingLabel: props.labels.loading,
    emptyLabel: props.labels.empty,
    tableLabel: tableLabel.value,
    gridRegionLabel: props.labels.gridRegion,
    selectAllLabel: props.labels.selectAll,
    selectRowLabel: props.labels.selectRow,
    actionsColumnLabel: props.labels.actionsColumn,
    sortedAscLabel: props.labels.sortedAsc,
    sortedDescLabel: props.labels.sortedDesc,
    notSortedLabel: props.labels.notSorted,
    columnFilterForLabel: props.labels.columnFilterFor,
    columns: displayColumns.value,
    windowedRows: windowedRows.value,
    sortStates: state.value.sortStates,
    columnFilters: columnFilterQueries.value,
    selectedIds: selectedSet.value,
    allVisibleSelected: allVisibleSelected.value,
    checkbox: ui.value.checkbox,
    columnFilter: ui.value.columnFilter,
    sort: ui.value.sort,
    rowHeight: ATTRIBUTE_TABLE_ROW_HEIGHT,
    virtualWindow: virtualWindow.value,
    bottomSpacerHeight: bottomSpacerHeight.value,
    itemMenus: ui.value.rowMenus ? props.itemMenus : [],
    itemMenuHost: props.itemMenuHost,
    isMenuDisabled: props.isMenuDisabled,
    onScrollMetrics: (top, height) => {
      if (scrollTop.value !== top) scrollTop.value = top;
      if (viewportHeight.value !== height) viewportHeight.value = height;
    },
    onSortColumn: (key, shiftKey) =>
      props.controller.toggleSort(key, shiftKey),
    onColumnFilterChange: (key, query) => {
      const mode = getAttributeTableColumnFilterMode(
        state.value.columnFilters[key],
      );
      applyColumnFilter(key, query, mode);
    },
    onToggleSelectAll: () => {
      void props.controller.toggleSelectAll(visibleRows.value);
    },
    onToggleRow: (row) => {
      void props.controller.toggleRow(row);
    },
    onRowMenuAction: props.onRowMenuAction,
  }),
);

watch(
  () => [state.value.page, state.value.pageSize] as const,
  () => {
    scrollTop.value = 0;
  },
);
</script>

<template>
  <div class="attribute-table">
    <div
      class="attribute-table__sr-only"
      role="status"
      aria-live="polite"
    >
      {{ selectionStatusText }}
    </div>
    <RegistryItem
      :componentKey="LIST_VIEW_MENU_COMPONENT_KEY.attributeTableToolbar"
      :defaultComponent="AttributeTableToolbar"
      :mapId="mapId"
      v-bind="toolbarProps"
    />
    <div class="attribute-table__body">
      <RegistryItem
        :componentKey="LIST_VIEW_MENU_COMPONENT_KEY.attributeTableGrid"
        :defaultComponent="AttributeTableGrid"
        :mapId="mapId"
        v-bind="gridProps"
      />
    </div>
    <RegistryItem
      v-if="ui.pager"
      :componentKey="LIST_VIEW_MENU_COMPONENT_KEY.attributeTablePager"
      :defaultComponent="AttributeTablePager"
      :mapId="mapId"
      v-bind="pagerProps"
    />
  </div>
</template>
