import type { Position, ControlLayout } from '@hungpvq/map-core';
import type { IDataset, MenuAction } from '../interfaces';
import type { AttributeTableController } from './controller';
import type {
  AttributeTableColumn,
  AttributeTableColumnsOption,
  AttributeTableRow,
} from './model';
import type { AttributeTableSortState } from './sort';
import type { AttributeTableStore } from './store';
import type { AttributeTableExportOptions } from './export-options';
import type { VirtualRowWindow } from './virtual-rows';

/**
 * UniversalRegistry component keys for Attribute Table UI.
 * Override with `registerComponent` / `registerComponentForMap`.
 *
 * Prefer {@link ATTRIBUTE_TABLE_COMPONENT_KEY.view} to replace the whole table
 * body with another table library (AG Grid, TanStack Table, …).
 */
export const ATTRIBUTE_TABLE_COMPONENT_KEY = {
  /** Full panel shell (popup + `useRegisterMapControl`). */
  root: 'attribute-table',
  /**
   * Entire table body inside the popup (toolbar + grid + pager by default).
   * Register a custom component here to swap in another table library.
   */
  view: 'attribute-table-view',
  /** Search / zoom / filter / clear / export strip (default view only). */
  toolbar: 'attribute-table-toolbar',
  /** Page controls (default view only). */
  pager: 'attribute-table-pager',
  /** Virtualized table body (default view only). */
  grid: 'attribute-table-grid',
} as const;

export type AttributeTableComponentKey =
  (typeof ATTRIBUTE_TABLE_COMPONENT_KEY)[keyof typeof ATTRIBUTE_TABLE_COMPONENT_KEY];

export type AttributeTableRowFilter = 'all' | 'selected';

export type AttributeTableSelectItem = {
  value: string | number;
  text: string;
};

export type AttributeTableViewLabels = {
  search: string;
  zoomToSelection: string;
  showAll: string;
  showSelected: string;
  clear: string;
  export: string;
  exportSelected: string;
  exporting: string;
  loading: string;
  empty: string;
  page: string;
  of: string;
  prev: string;
  next: string;
  rowsPerPage: string;
};

/** Show/hide built-in controls. Component override stays on Registry. */
export type AttributeTableUiOptions = {
  search?: boolean;
  export?: boolean;
  zoomToSelection?: boolean;
  clearSelection?: boolean;
  rowFilter?: boolean;
  pager?: boolean;
  checkbox?: boolean;
  rowMenus?: boolean;
  /** When false, disable sorting for the whole table (default true). */
  sort?: boolean;
};

export const ATTRIBUTE_TABLE_UI_DEFAULTS: Required<AttributeTableUiOptions> = {
  search: true,
  export: true,
  zoomToSelection: true,
  clearSelection: true,
  rowFilter: true,
  pager: true,
  checkbox: true,
  rowMenus: true,
  sort: true,
};

export function resolveAttributeTableUi(
  ui?: AttributeTableUiOptions,
): Required<AttributeTableUiOptions> {
  return { ...ATTRIBUTE_TABLE_UI_DEFAULTS, ...ui };
}

/**
 * Props for the Attribute Table shell registered as
 * {@link ATTRIBUTE_TABLE_COMPONENT_KEY.root}.
 * Match attrs from `createMenuItemAttributeTable` / `addComponent`.
 */
export type AttributeTableProps = {
  layer: IDataset;
  columns?: AttributeTableColumnsOption;
  /** Inject store; default is DM sibling or local GeoJSON. */
  store?: AttributeTableStore;
  ui?: AttributeTableUiOptions;
  /**
   * Export UX: local format menu, custom actions, or a single handler
   * (API / dialog). See {@link AttributeTableExportOptions}.
   */
  export?: AttributeTableExportOptions;
  /**
   * Initial row filter when the table opens.
   * `'selected'` shows only selected rows (empty until user selects).
   */
  rowFilter?: AttributeTableRowFilter;
  mapId?: string;
  dragId?: string;
  position?: Position;
  controlLayout?: ControlLayout;
  controlVisible?: boolean;
  controlOrder?: number | string;
  btnWidth?: number;
  /** Vue: emitted on dismiss. React: use `onClose`. */
  onClose?: () => void;
};

/**
 * Full body contract for {@link ATTRIBUTE_TABLE_COMPONENT_KEY.view}.
 * Read rows/columns from `controller.getState()`; call controller methods for
 * paging / search / sort / selection.
 */
export type AttributeTableViewProps = {
  mapId?: string;
  layer: IDataset;
  controller: AttributeTableController;
  pageSizeItems: AttributeTableSelectItem[];
  labels: AttributeTableViewLabels;
  ui?: AttributeTableUiOptions;

  onExportClick: (event: MouseEvent) => void;

  itemMenus: MenuAction[];
  itemMenuHost: IDataset;
  isMenuDisabled: (menu: MenuAction) => boolean;
  onRowMenuAction: (
    row: AttributeTableRow,
    menu: MenuAction,
    event: MouseEvent,
  ) => void;
};

export type AttributeTableToolbarProps = {
  mapId?: string;
  query: string;
  searchPlaceholder: string;
  zoomToSelection: boolean;
  zoomLabel: string;
  rowFilter: AttributeTableRowFilter;
  filterItems: AttributeTableSelectItem[];
  clearLabel: string;
  clearDisabled: boolean;
  exportLabel: string;
  exportDisabled: boolean;
  /** True while an export action / handler is in flight. */
  exportLoading?: boolean;
  ui?: AttributeTableUiOptions;
  onQueryChange: (value: string) => void;
  onZoomToSelectionChange: (value: boolean) => void;
  onRowFilterChange: (value: AttributeTableRowFilter) => void;
  onClearSelection: () => void;
  onExportClick: (event: MouseEvent) => void;
};

export type AttributeTablePagerProps = {
  mapId?: string;
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  loading: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPageSizeChange: (size: number | string) => void;
  pageSizeItems?: AttributeTableSelectItem[];
  pageLabel: string;
  ofLabel: string;
  prevLabel: string;
  nextLabel: string;
  rowsPerPageLabel: string;
};

export type AttributeTableGridProps = {
  mapId?: string;
  loading: boolean;
  empty: boolean;
  loadingLabel: string;
  emptyLabel: string;
  columns: AttributeTableColumn[];
  windowedRows: AttributeTableRow[];
  sortStates: AttributeTableSortState[];
  selectedIds: ReadonlySet<string>;
  allVisibleSelected: boolean;
  checkbox?: boolean;
  /** When false, no column headers are sortable (from `ui.sort`). Default true. */
  sort?: boolean;
  rowHeight: number;
  virtualWindow: VirtualRowWindow;
  bottomSpacerHeight: number;
  itemMenus: MenuAction[];
  itemMenuHost: IDataset;
  isMenuDisabled: (menu: MenuAction) => boolean;
  onScrollMetrics: (scrollTop: number, viewportHeight: number) => void;
  onSortColumn: (key: string, shiftKey: boolean) => void;
  onToggleSelectAll: () => void;
  onToggleRow: (row: AttributeTableRow) => void;
  onRowMenuAction: (
    row: AttributeTableRow,
    menu: MenuAction,
    event: MouseEvent,
  ) => void;
};
