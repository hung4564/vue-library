import type { IDataset } from '@hungpvq/map-dataset';
import type {
  MenuAction,
  MenuControlId,
  PartitionedMenuActions,
} from '@hungpvq/map-dataset/menu';

/** Mirrors map-dataset `DatasetMenuFor` without importing non-exported type. */
export type DatasetMenuTarget = 'item' | 'layer';

export type DatasetDebugSession = {
  mapId?: string;
  datasetId?: string;
  control?: MenuControlId | string;
  target?: DatasetMenuTarget;
  menuId?: string;
  /** Dataset inspector sub-pane (survives remounts). */
  pane?: 'roots' | 'inspect' | 'menus' | 'tree' | 'find';
};

export type DatasetNodeSummary = {
  id: string;
  name: string;
  type: string;
};

export type DatasetTreeNode = DatasetNodeSummary & {
  children: DatasetTreeNode[];
};

/**
 * Hierarchy role from map-dataset structure (not `IDataset.type`):
 * - `root` — no parent
 * - `group` — nested composite (docs: group dataset)
 * - `leaf` — no children protocol
 */
export type DatasetHierarchyKind = 'root' | 'group' | 'leaf';

export type DatasetDescribe = DatasetNodeSummary & {
  dependsOn?: string[];
  parentId?: string;
  childCount: number;
  methodNames: string[];
};

/** Framework-agnostic inspect snapshot for Dataset Devtools. */
export type DatasetInspectSnapshot = {
  identity: {
    id: string;
    name: string;
    type: string;
    kind: DatasetHierarchyKind;
    methodNames: string[];
  };
  hierarchy: {
    rootId: string;
    rootName: string;
    parentId?: string;
    parentName?: string;
    childCount: number;
    depth: number;
    pathIds: string[];
    pathNames: string[];
    pathLabel: string;
    children: DatasetNodeSummary[];
  };
  dependsOn?: string[];
  runtime: {
    isComposite: boolean;
    hasAddToMap: boolean;
    hasRemoveFromMap: boolean;
    hasGetData: boolean;
    hasGetMenus: boolean;
    show?: boolean;
    opacity?: number;
    selected?: boolean;
  };
  dataPreview?: unknown;
  tree: DatasetTreeNode;
};

export type DatasetSearchHit = DatasetNodeSummary & {
  kind: DatasetHierarchyKind;
  rootId: string;
  rootName: string;
  pathLabel: string;
};

export type MenuSourceKind = 'global' | 'menu-part' | 'local' | 'unknown';

export type MenuSummary = {
  /**
   * Alias of `id` (kept for callers). Prefer `id` in UI — Vue treats `key`
   * specially on v-for nodes.
   */
  key: string;
  /** Always set in debug summaries — generated `anon:…` when the live menu had no id. */
  id: string;
  /** True when `id` was synthesized for debug (not present on the live menu). */
  idGenerated?: boolean;
  name?: string;
  type: string;
  order?: number;
  location?: string;
  effectiveLocation?: string;
  hidden: boolean;
  disabled: boolean;
  hasClick: boolean;
  icon?: string;
  componentKey?: string;
  source: MenuSourceKind;
  sourceLabel: string;
  hostType?: string;
  hostId?: string;
  byControlKeys: string[];
  control?: string;
  target?: DatasetMenuTarget;
};

export type MenuInspectDetail = {
  /** Same as summary.key — usable with inspectMenu({ menuId }). */
  key: string;
  id: string;
  idGenerated?: boolean;
  name?: string;
  type: string;
  summary: MenuSummary;
  location?: string;
  effectiveLocation: string;
  order?: number;
  icon?: string;
  componentKey?: string;
  byControl?: unknown;
  byControlKeys: string[];
  hasClick: boolean;
  source: MenuSourceKind;
  sourceLabel: string;
  hostType?: string;
  hostId?: string;
  control?: string;
  target?: DatasetMenuTarget;
  datasetId?: string;
  datasetName?: string;
  datasetType?: string;
  rawKeys: string[];
};

export type PartitionedMenuSummary = {
  extra: MenuSummary[];
  menu: MenuSummary[];
  bottom: MenuSummary[];
  prebottom: MenuSummary[];
  title: MenuSummary[];
};

export type ExplainStep = {
  step: number;
  message: string;
  detail?: Record<string, unknown>;
};

/** Structured help content — formatted to text by `help()`. */
export type DatasetDebugHelp = {
  title: string;
  quickStart: string[];
  session: Record<string, string>;
  navigate: Record<string, string>;
  find: Record<string, string>;
  menus: Record<string, string>;
  pinAndLive: Record<string, string>;
};

export type DatasetDebugApi = {
  session: DatasetDebugSession;
  /** Bumps on every `setSession` so UI can re-hydrate after Debug menu clicks. */
  sessionRev: number;
  mapId?: string;
  datasetId?: string;
  control?: string;
  target?: DatasetMenuTarget;
  dataset?: IDataset;
  lastPart?: IDataset;
  menus?: MenuAction[];
  partitioned?: PartitionedMenuActions;
  selectedMenu?: MenuAction;
  lastPreview?: PartitionedMenuSummary;
  lastInspect?: MenuInspectDetail | Record<string, unknown>;
  lastExplain?: ExplainStep[];
  vars: Record<string, unknown>;
  MENU_CONTROL_ID: Record<string, string>;

  listMapIds: () => string[];
  /** Store roots only — for manual dataset picking. */
  listDatasets: (mapId?: string) => DatasetNodeSummary[];
  /**
   * Roots plus the current session dataset when it is a nested part
   * (keeps Debug-menu selection visible without listing every node).
   */
  listPickerDatasets: (mapId?: string) => DatasetNodeSummary[];
  getDataset: (mapId?: string, datasetId?: string) => IDataset | undefined;
  setSession: (partial: Partial<DatasetDebugSession>) => DatasetDebugSession;
  refresh: () => void;
  pin: (name?: string, value?: unknown) => unknown;
  clearPins: () => void;
  /** Pretty multi-line guide for F12 (also returned as a string). */
  help: () => string;

  tree: (dataset?: IDataset) => DatasetTreeNode | undefined;
  parentChain: (dataset?: IDataset) => DatasetNodeSummary[];
  root: (dataset?: IDataset) => IDataset | undefined;
  children: (dataset?: IDataset) => IDataset[];
  pathIds: (dataset?: IDataset) => string[];

  findPartByType: (type: string, from?: IDataset) => IDataset | undefined;
  findAllByType: (type: string, from?: IDataset) => IDataset[];
  findAllInStore: (type: string, mapId?: string) => IDataset[];
  explainFindPart: (type: string, from?: IDataset) => ExplainStep[];

  listTypes: (from?: IDataset) => string[];
  /** Unique `type` values across all store roots (runtime discovery). */
  listTypesInStore: (mapId?: string) => string[];
  /** All nodes under store roots — for search/filter. */
  listSearchable: (mapId?: string) => DatasetSearchHit[];
  /** Forest of store roots as trees. */
  listForest: (mapId?: string) => DatasetTreeNode[];
  /** Live tree types + common catalog for Find-part suggestions. */
  suggestPartTypes: (from?: IDataset) => string[];
  describe: (dataset?: IDataset) => DatasetDescribe | undefined;
  /** Full inspect snapshot (identity / hierarchy / runtime / data preview). */
  inspect: (dataset?: IDataset) => DatasetInspectSnapshot | undefined;
  lastInspectDataset?: DatasetInspectSnapshot;
  getMenusRaw: (dataset?: IDataset) => MenuAction[];
  getMenuPartData: (dataset?: IDataset) => unknown;

  previewMenus: (opts?: {
    mapId?: string;
    datasetId?: string;
    control?: string;
    target?: DatasetMenuTarget;
  }) => PartitionedMenuSummary | undefined;
  explainMenus: (opts?: {
    mapId?: string;
    datasetId?: string;
    control?: string;
    target?: DatasetMenuTarget;
  }) => ExplainStep[];
  inspectMenu: (opts?: {
    mapId?: string;
    datasetId?: string;
    control?: string;
    target?: DatasetMenuTarget;
    menuId?: string;
  }) => MenuInspectDetail | undefined;
  invokeMenu: (opts?: {
    mapId?: string;
    datasetId?: string;
    control?: string;
    target?: DatasetMenuTarget;
    menuId?: string;
    value?: unknown;
    meta?: Record<string, unknown>;
  }) => void;
};

declare global {
  interface Window {
    __hungpvqDatasetDebug?: DatasetDebugApi;
  }
}

export {};
