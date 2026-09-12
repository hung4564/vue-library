<script lang="ts">
export default { name: 'attribute-table-view' };
</script>
<script setup lang="ts">
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

const filterItems = computed(() => [
  { value: 'all', text: props.labels.showAll },
  { value: 'selected', text: props.labels.showSelected },
]);

const visibleRows = computed(() => {
  const rows = state.value.rows;
  if (state.value.rowFilter !== 'selected') return rows;
  const selected = new Set(state.value.selectedIds);
  return rows.filter((row) => selected.has(row.id));
});
const exportDisabled = computed(
  () => !props.controller.canExport() || state.value.exporting,
);
const exportLoading = computed(() => state.value.exporting);
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

const toolbarProps = computed(
  (): AttributeTableToolbarProps => ({
    mapId: props.mapId,
    query: state.value.search,
    searchPlaceholder: props.labels.search,
    zoomToSelection: state.value.zoomToSelection,
    zoomLabel: props.labels.zoomToSelection,
    rowFilter: state.value.rowFilter,
    filterItems: filterItems.value,
    clearLabel: props.labels.clear,
    clearDisabled: state.value.selectedIds.length === 0,
    exportLabel: state.value.exporting
      ? props.labels.exporting
      : state.value.selectedIds.length > 0
        ? props.labels.exportSelected
        : props.labels.export,
    exportDisabled: exportDisabled.value,
    exportLoading: exportLoading.value,
    ui: ui.value,
    onQueryChange: (value) => props.controller.setSearch(value),
    onZoomToSelectionChange: (value) =>
      props.controller.setZoomToSelection(value),
    onRowFilterChange: (value) => props.controller.setRowFilter(value),
    onClearSelection: () => props.controller.clearSelection(),
    onExportClick: props.onExportClick,
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
    columns: state.value.columns,
    windowedRows: windowedRows.value,
    sortStates: state.value.sortStates,
    selectedIds: selectedSet.value,
    allVisibleSelected: allVisibleSelected.value,
    checkbox: ui.value.checkbox,
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
