/**
 * Public entry for `@hungpvq/map-dataset/attribute-table`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export type {
  AttributeTableColumnFilterOptions,
  AttributeTableController,
  AttributeTableControllerEvent,
  AttributeTableControllerReason,
  AttributeTableControllerState,
  CreateAttributeTableControllerOptions,
} from './controller';
export { createAttributeTableController } from './controller';
export type {
  AttributeTablePart,
  CreateDatasetPartAttributeTableOptions,
} from './dataset-part';
export {
  createDatasetPartAttributeTable,
  isAttributeTableView,
  resolveAttributeTableColumnsOption,
  resolveAttributeTableUiOption,
} from './dataset-part';
export type {
  AttributeTableColumnFilter,
  AttributeTableColumnFilterEntry,
  AttributeTableColumnFilterMode,
  AttributeTableColumnFilters,
  AttributeTableColumnTextFilter,
  AttributeTableColumnTextFilterMode,
  AttributeTableColumnTextFilters,
} from './filter';
export {
  ATTRIBUTE_TABLE_COLUMN_FILTER_MODES,
  filterAttributeTableRowsByColumnText,
  getAttributeTableColumnFilterMode,
  getAttributeTableColumnFilterQuery,
  getAttributeTableColumnFilterQueryEnd,
  matchAttributeTableColumnFilter,
  matchAttributeTableColumnText,
  resolveAttributeTableVisibleColumns,
} from './filter';
export {
  ATTRIBUTE_TABLE_LOCALE,
  formatAttributeTableSelectionStatus,
} from './locale';
export type { AttributeTableMenuOptions } from './menu';
export {
  createMenuItemAttributeTable,
  isAttributeTableMenuHidden,
} from './menu';
export type {
  AttributeTableCellFormatContext,
  AttributeTableCellProps,
  AttributeTableColumn,
  AttributeTableColumnDef,
  AttributeTableColumnsOption,
  AttributeTableHeaderProps,
  AttributeTableRow,
  AttributeTableSelectRowsPayload,
} from './model';
export {
  ATTRIBUTE_TABLE_CONTROL,
  ATTRIBUTE_TABLE_GEOMETRY_KEY,
  attributeTableControlId,
  attributeTableIdentifyRowSelectKey,
  buildAttributeTable,
  clearPendingAttributeTableSelectRows,
  filterAttributeTableRows,
  formatAttributeCell,
  getAttributeTableCellRaw,
  queueAttributeTableSelectRows,
  resolveAttributeTableColumns,
  resolveAttributeTableComponentRef,
  resolveAttributeTableSelectedRowIds,
  takePendingAttributeTableSelectRows,
} from './model';
export type {
  AttributeTableComponentKey,
  AttributeTableGridProps,
  AttributeTablePagerProps,
  AttributeTableProps,
  AttributeTableRowFilter,
  AttributeTableSelectItem,
  AttributeTableToolbarProps,
  AttributeTableUiOptions,
  AttributeTableViewLabels,
  AttributeTableViewProps,
} from './props';
export {
  ATTRIBUTE_TABLE_COMPONENT_KEY,
  ATTRIBUTE_TABLE_UI_DEFAULTS,
  resolveAttributeTableUi,
} from './props';
export type { AttributeTableSortDir, AttributeTableSortState } from './sort';
export {
  sortAttributeTableRows,
  toggleAttributeTableMultiSort,
  toggleAttributeTableSort,
} from './sort';
export type {
  AttributeTableListIntent,
  AttributeTableStore,
  AttributeTableStorePage,
  AttributeTableStoreQuery,
  CreateAttributeTableStoreOptions,
} from './store';
export {
  ATTRIBUTE_TABLE_DEFAULT_PAGE_SIZE,
  ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS,
  createAttributeTableStoreFromDataset,
  createDataManagementAttributeTableStore,
  createLocalAttributeTableStore,
} from './store';
export type { VirtualRowWindow } from './virtual-rows';
export {
  ATTRIBUTE_TABLE_ROW_HEIGHT,
  getVirtualRowWindow,
} from './virtual-rows';
