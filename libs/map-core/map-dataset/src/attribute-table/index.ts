/**
 * Public entry for `@hungpvq/map-dataset/attribute-table`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export {
  createAttributeTableController,
} from './controller';
export type {
  AttributeTableController,
  AttributeTableControllerEvent,
  AttributeTableControllerReason,
  AttributeTableControllerState,
  CreateAttributeTableControllerOptions,
} from './controller';

export {
  createDatasetPartAttributeTable,
  isAttributeTableView,
  resolveAttributeTableColumnsOption,
  resolveAttributeTableUiOption,
} from './dataset-part';
export type {
  AttributeTablePart,
  CreateDatasetPartAttributeTableOptions,
} from './dataset-part';

export {
  ATTRIBUTE_TABLE_LOCALE,
  formatAttributeTableSelectionStatus,
} from './locale';

export {
  createMenuItemAttributeTable,
  isAttributeTableMenuHidden,
} from './menu';
export type { AttributeTableMenuOptions } from './menu';

export {
  ATTRIBUTE_TABLE_CONTROL,
  ATTRIBUTE_TABLE_GEOMETRY_KEY,
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
  ATTRIBUTE_TABLE_COMPONENT_KEY,
  ATTRIBUTE_TABLE_UI_DEFAULTS,
  resolveAttributeTableUi,
} from './props';
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
  filterAttributeTableRowsByColumnText,
  matchAttributeTableColumnText,
} from './filter';
export type {
  AttributeTableColumnTextFilter,
  AttributeTableColumnTextFilterMode,
  AttributeTableColumnTextFilters,
} from './filter';

export {
  sortAttributeTableRows,
  toggleAttributeTableMultiSort,
  toggleAttributeTableSort,
} from './sort';
export type {
  AttributeTableSortDir,
  AttributeTableSortState,
} from './sort';

export {
  ATTRIBUTE_TABLE_DEFAULT_PAGE_SIZE,
  ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS,
  createAttributeTableStoreFromDataset,
  createDataManagementAttributeTableStore,
  createLocalAttributeTableStore,
} from './store';
export type {
  AttributeTableListIntent,
  AttributeTableStore,
  AttributeTableStorePage,
  AttributeTableStoreQuery,
  CreateAttributeTableStoreOptions,
} from './store';

export {
  ATTRIBUTE_TABLE_ROW_HEIGHT,
  getVirtualRowWindow,
} from './virtual-rows';
export type { VirtualRowWindow } from './virtual-rows';
