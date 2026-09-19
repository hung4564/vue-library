import type { IDataset } from '@hungpvq/map-dataset';
import { DatasetService } from '@hungpvq/map-dataset';
import { MENU_CONTROL_ID } from '@hungpvq/map-dataset/menu';
import { loggerFactory } from '@hungpvq/shared-log';
import { getDatasetStore, listMapIds } from '../store-access';
import {
  describeDataset,
  getMenuPartData,
  getMenusRaw,
  listTypesInSubtree,
  suggestPartTypes,
} from './describe';
import {
  collectSearchableDatasets,
  inspectDataset,
  listTypesInStoreRoots,
} from './inspect';
import {
  debugFindAllByType,
  debugFindPartByType,
  explainFindPart as explainFindPartSteps,
} from './find';
import {
  explainMenus as explainMenusSteps,
  findMenuInResolved,
  inspectMenuAction,
  invokeResolvedMenu,
  resolveAndPartitionMenus,
} from './menu-preview';
import {
  buildDatasetTree,
  findDatasetById,
  getDatasetChildren,
  getParentChain,
  getPathIds,
  getRootDataset,
  toDatasetSummary,
} from './tree';
import type {
  DatasetDebugApi,
  DatasetDebugHelp,
  DatasetDebugSession,
  DatasetMenuTarget,
  DatasetNodeSummary,
} from './types';
import { getMapDebugStore } from './map-debug-store';

const logger = loggerFactory.createLogger().setNamespace('map-debug:dataset');

/** Console alias for F12; canonical singleton lives on `map:debug.dataset`. */
const WINDOW_KEY = '__hungpvqDatasetDebug';

type DatasetDebugMenuHooks = {
  onInstall?: () => void;
  onUninstall?: () => void;
};

let menuHooks: DatasetDebugMenuHooks = {};

/** Used by menu-debug-item to attach global debug menus on install. */
export function setDatasetDebugMenuHooks(hooks: DatasetDebugMenuHooks): void {
  menuHooks = hooks;
}

const session: DatasetDebugSession = {
  target: 'layer',
  control: MENU_CONTROL_ID.layerControl,
};

let sessionRev = 0;

const vars: Record<string, unknown> = {};

let api: DatasetDebugApi | undefined;

function resolveDataset(
  mapId?: string,
  datasetId?: string,
): IDataset | undefined {
  const mid = mapId ?? session.mapId;
  const did = datasetId ?? session.datasetId;
  if (!mid || !did) return undefined;
  const store = getDatasetStore(mid);
  if (!store) return undefined;
  const direct = store.datasets[did] as IDataset | undefined;
  if (direct) return direct;
  for (const root of Object.values(store.datasets)) {
    if (!root) continue;
    const found = findDatasetById(root as IDataset, did);
    if (found) return found;
  }
  return undefined;
}

function syncAliases(target: DatasetDebugApi) {
  target.mapId = session.mapId;
  target.datasetId = session.datasetId;
  target.control = session.control;
  target.target = session.target;
  target.dataset = resolveDataset();
  target.session = { ...session };
  target.sessionRev = sessionRev;
}

function listDatasets(mapId?: string): DatasetNodeSummary[] {
  return listRootDatasets(mapId).map(toDatasetSummary);
}

function listRootDatasets(mapId?: string): IDataset[] {
  const mid = mapId ?? session.mapId;
  if (!mid) return [];
  const store = getDatasetStore(mid);
  if (!store) return [];
  const ids = store.datasetIds?.value ?? Object.keys(store.datasets);
  return ids
    .map((id) => store.datasets[id] as IDataset | undefined)
    .filter((d): d is IDataset => Boolean(d));
}

/**
 * Dropdown options: store roots only, plus the current session node when it is
 * a nested part (e.g. after Debug dataset menu click).
 */
function listPickerDatasets(mapId?: string): DatasetNodeSummary[] {
  const mid = mapId ?? session.mapId;
  const roots = listDatasets(mid);
  const current = resolveDataset(mid, session.datasetId);
  if (!current) return roots;
  if (roots.some((r) => r.id === current.id)) return roots;
  return [toDatasetSummary(current), ...roots];
}

function refreshLive(target: DatasetDebugApi) {
  syncAliases(target);
  const dataset = target.dataset;
  if (!dataset) {
    target.menus = undefined;
    target.partitioned = undefined;
    target.lastPreview = undefined;
    return;
  }
  const resolved = resolveAndPartitionMenus(dataset, {
    mapId: session.mapId,
    control: session.control,
    target: session.target,
  });
  target.menus = resolved.menus;
  target.partitioned = resolved.partitioned;
  target.lastPreview = resolved.summary;
  if (session.menuId) {
    const menu = findMenuInResolved(resolved.menus, session.menuId);
    target.selectedMenu = menu;
  }
}

function buildHelp(): DatasetDebugHelp {
  const d = 'window.__hungpvqDatasetDebug';
  // Canonical pin: shared-store key `map:debug`.dataset (same object as window alias).
  return {
    title: `${d} — Dataset Inspector`,
    quickStart: [
      `${d}.listMapIds()`,
      `${d}.listDatasets('my-map')`,
      `${d}.setSession({ mapId: 'my-map', datasetId: 'layer-id', control: ${d}.MENU_CONTROL_ID.layerControl, target: 'layer' })`,
      `createMenuItemDebugDataset (auto via installDatasetDebug) — Debug dataset menu`,
      `${d}.tree()`,
      `${d}.previewMenus()`,
    ],
    session: {
      setSession: 'partial → { mapId, datasetId, control, target, menuId }; refreshes live fields',
      refresh: 're-resolve dataset + menus from current session',
      session: 'current { mapId, datasetId, control, target, menuId }',
      listMapIds: '() → map ids with a dataset store',
      listDatasets: '(mapId?) → root summaries only (manual picker)',
      listPickerDatasets:
        '(mapId?) → roots + current session node when nested (Debug menu)',
      getDataset: '(mapId?, datasetId?) → IDataset (defaults to session)',
    },
    navigate: {
      tree: '() → nested { id, name, type, children }',
      listForest: '(mapId?) → store roots as trees',
      root: '() → root IDataset',
      children: '() → direct children',
      parentChain: '() → ancestors [{ id, name, type }]',
      pathIds: '() → id path root → node',
      describe: '() → id, type, dependsOn, methods, childCount',
      inspect: '() → identity / hierarchy / runtime / dataPreview snapshot',
      listTypes: '() → unique part types in current subtree',
      listTypesInStore: '(mapId?) → unique types across all store roots',
      listSearchable: '(mapId?) → flat nodes for search/filter',
      suggestPartTypes: '() → live types + common catalog (Find suggestions)',
      note: 'optional dataset arg; else uses session dataset',
    },
    find: {
      findPartByType: '(type) → first match; sets lastPart',
      findAllByType: '(type) → all under current dataset',
      findAllInStore: '(type, mapId?) → all in map store',
      explainFindPart: '(type) → walk steps; sets lastExplain',
      commonTypes:
        'menu, list, list-item, identify, source, layer, bound, highlight, attribute-table, …',
    },
    menus: {
      previewMenus: '(opts?) → { extra, menu, bottom, … }; sets menus / lastPreview',
      explainMenus: '(opts?) → show/hide steps; sets lastExplain',
      inspectMenu: '({ menuId }) → action detail by id or generated anon id; sets selectedMenu / lastInspect',
      invokeMenu: '({ menuId, value?, meta? }) → run click (needs mapId + dataset)',
      getMenusRaw: '() → raw menus on dataset',
      getMenuPartData: '() → menu part payload',
      MENU_CONTROL_ID:
        '{ layerControl, layerDetail, identify, attributeTable } — opts merge into session',
    },
    pinAndLive: {
      pin: '(name?, value?) → vars[name] (default value = selectedMenu ?? lastPart ?? dataset)',
      clearPins: '() → wipe vars',
      vars: 'pinned values bag',
      live: 'dataset, lastPart, menus, partitioned, selectedMenu, lastPreview, lastInspect, lastExplain, mapId, datasetId, control, target',
    },
  };
}

type HelpSectionKey = Exclude<keyof DatasetDebugHelp, 'title'>;

const HELP_SECTION_LABELS: { key: HelpSectionKey; label: string }[] = [
  { key: 'quickStart', label: 'Quick start' },
  { key: 'session', label: 'Session' },
  { key: 'navigate', label: 'Navigate' },
  { key: 'find', label: 'Find' },
  { key: 'menus', label: 'Menus' },
  { key: 'pinAndLive', label: 'Pin & live' },
];

/** Pretty multi-line guide for F12 `help()`. */
function formatDatasetDebugHelp(guide: DatasetDebugHelp): string {
  const lines: string[] = [guide.title, ''];

  for (const { key, label } of HELP_SECTION_LABELS) {
    const section = guide[key];
    lines.push(`── ${label} ──`);
    if (Array.isArray(section)) {
      for (const item of section) {
        lines.push(`  • ${item}`);
      }
    } else {
      const maxKey = Math.max(0, ...Object.keys(section).map((k) => k.length));
      for (const [k, v] of Object.entries(section)) {
        lines.push(`  ${k.padEnd(maxKey)}  ${v}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

function createApi(): DatasetDebugApi {
  const target = {
    session: { ...session },
    vars,
    MENU_CONTROL_ID: { ...MENU_CONTROL_ID },
  } as unknown as DatasetDebugApi;

  target.listMapIds = () => listMapIds();
  target.listDatasets = (mapId) => listDatasets(mapId);
  target.listPickerDatasets = (mapId) => listPickerDatasets(mapId);
  target.getDataset = (mapId, datasetId) => resolveDataset(mapId, datasetId);

  target.setSession = (partial) => {
    let changed = false;
    for (const [key, value] of Object.entries(partial)) {
      if (session[key as keyof DatasetDebugSession] !== value) {
        changed = true;
        break;
      }
    }
    Object.assign(session, partial);
    if (changed) sessionRev += 1;
    refreshLive(target);
    return { ...session };
  };

  target.refresh = () => refreshLive(target);

  target.pin = (name, value) => {
    const key = name ?? 'pinned';
    const v =
      value !== undefined
        ? value
        : (target.selectedMenu ?? target.lastPart ?? target.dataset);
    vars[key] = v;
    return v;
  };

  target.clearPins = () => {
    for (const key of Object.keys(vars)) delete vars[key];
  };

  target.help = () => {
    const text = formatDatasetDebugHelp(buildHelp());
    // Print as preformatted text so F12 shows a readable guide, not an object tree.
    console.log(`%c${text}`, 'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre');
    return text;
  };

  target.tree = (dataset) => {
    const node = dataset ?? target.dataset;
    return node ? buildDatasetTree(node) : undefined;
  };

  target.parentChain = (dataset) => {
    const node = dataset ?? target.dataset;
    return node ? getParentChain(node) : [];
  };

  target.root = (dataset) => {
    const node = dataset ?? target.dataset;
    return node ? getRootDataset(node) : undefined;
  };

  target.children = (dataset) => {
    const node = dataset ?? target.dataset;
    return node ? getDatasetChildren(node) : [];
  };

  target.pathIds = (dataset) => {
    const node = dataset ?? target.dataset;
    return node ? getPathIds(node) : [];
  };

  target.findPartByType = (type, from) => {
    const node = from ?? target.dataset;
    if (!node) return undefined;
    const part = debugFindPartByType(node, type);
    target.lastPart = part;
    return part;
  };

  target.findAllByType = (type, from) => {
    const node = from ?? target.dataset;
    if (!node) return [];
    return debugFindAllByType(node, type);
  };

  target.findAllInStore = (type, mapId) => {
    const mid = mapId ?? session.mapId;
    if (!mid) return [];
    const store = getDatasetStore(mid);
    if (!store) return [];
    return DatasetService.getAllComponentsByType(store as never, type);
  };

  target.explainFindPart = (type, from) => {
    const node = from ?? target.dataset;
    if (!node) return [];
    const steps = explainFindPartSteps(node, type);
    target.lastExplain = steps;
    return steps;
  };

  target.listTypes = (from) => {
    const node = from ?? target.dataset;
    return node ? listTypesInSubtree(node) : [];
  };

  target.listTypesInStore = (mapId) =>
    listTypesInStoreRoots(listRootDatasets(mapId));

  target.listSearchable = (mapId) =>
    collectSearchableDatasets(listRootDatasets(mapId));

  target.listForest = (mapId) =>
    listRootDatasets(mapId).map((root) => buildDatasetTree(root));

  target.suggestPartTypes = (from) =>
    suggestPartTypes(from ?? target.dataset);

  target.describe = (dataset) => {
    const node = dataset ?? target.dataset;
    return node ? describeDataset(node) : undefined;
  };

  target.inspect = (dataset) => {
    const node = dataset ?? target.dataset;
    if (!node) {
      target.lastInspectDataset = undefined;
      return undefined;
    }
    const snap = inspectDataset(node);
    target.lastInspectDataset = snap;
    return snap;
  };

  target.getMenusRaw = (dataset) => {
    const node = dataset ?? target.dataset;
    return node ? getMenusRaw(node) : [];
  };

  target.getMenuPartData = (dataset) => {
    const node = dataset ?? target.dataset;
    return node ? getMenuPartData(node) : undefined;
  };

  target.previewMenus = (opts) => {
    if (opts) Object.assign(session, opts);
    const dataset = resolveDataset(opts?.mapId, opts?.datasetId);
    if (!dataset) return undefined;
    const resolved = resolveAndPartitionMenus(dataset, {
      mapId: session.mapId,
      control: session.control,
      target: session.target,
    });
    target.menus = resolved.menus;
    target.partitioned = resolved.partitioned;
    target.lastPreview = resolved.summary;
    syncAliases(target);
    return resolved.summary;
  };

  target.explainMenus = (opts) => {
    if (opts) Object.assign(session, opts);
    const dataset = resolveDataset(opts?.mapId, opts?.datasetId);
    if (!dataset) return [];
    const steps = explainMenusSteps(dataset, {
      mapId: session.mapId,
      control: session.control,
      target: session.target as DatasetMenuTarget | undefined,
    });
    target.lastExplain = steps;
    return steps;
  };

  target.inspectMenu = (opts) => {
    if (opts) Object.assign(session, opts);
    const dataset = resolveDataset(opts?.mapId, opts?.datasetId);
    if (!dataset) return undefined;
    const menuId = opts?.menuId ?? session.menuId;
    if (!menuId) return undefined;
    const resolved = resolveAndPartitionMenus(dataset, {
      mapId: session.mapId,
      control: session.control,
      target: session.target,
    });
    const menu = findMenuInResolved(resolved.menus, menuId);
    if (!menu) return undefined;
    target.selectedMenu = menu;
    const resolvedIndex = resolved.menus.indexOf(menu);
    const inspected = inspectMenuAction(menu, resolved.ctx, {
      dataset,
      control: session.control,
      target: session.target,
      sourceIndex: resolved.sourceIndex,
      resolvedIndex: resolvedIndex >= 0 ? resolvedIndex : 0,
    });
    target.lastInspect = inspected;
    syncAliases(target);
    return inspected;
  };

  target.invokeMenu = (opts) => {
    if (opts) Object.assign(session, opts);
    const dataset = resolveDataset(opts?.mapId, opts?.datasetId);
    const mapId = session.mapId;
    if (!dataset || !mapId) {
      logger
        .with({ fn: 'invokeMenu', span: 'menu.action' })
        .warn('invokeMenu skipped because mapId or dataset is missing.');
      return;
    }
    const menuId = opts?.menuId ?? session.menuId;
    const resolved = resolveAndPartitionMenus(dataset, {
      mapId,
      control: session.control,
      target: session.target,
    });
    const menu =
      (menuId ? findMenuInResolved(resolved.menus, menuId) : undefined) ??
      target.selectedMenu;
    if (!menu) {
      logger
        .with({ fn: 'invokeMenu', span: 'menu.action' })
        .warn('invokeMenu skipped because the menu was not found.', { menuId });
      return;
    }
    invokeResolvedMenu(menu, {
      mapId,
      layer: dataset,
      control: session.control,
      value: opts?.value,
      meta: opts?.meta,
    });
  };

  refreshLive(target);
  return target;
}

/**
 * Install dataset debug API on `map:debug.dataset` (shared-store) and mirror to
 * `window.__hungpvqDatasetDebug` for F12. Requires `@hungpvq/map-dataset`.
 * Idempotent — mutates the same object reference across refreshes.
 */
export function installDatasetDebug(): DatasetDebugApi {
  const bag = getMapDebugStore();
  const existing = bag.dataset ?? api;
  if (existing) {
    api = existing;
    bag.dataset = existing;
    refreshLive(existing);
    syncWindowAlias(existing);
    menuHooks.onInstall?.();
    return existing;
  }
  api = createApi();
  bag.dataset = api;
  syncWindowAlias(api);
  menuHooks.onInstall?.();
  logger
    .with({ fn: 'installDatasetDebug', span: 'init' })
    .debug('map:debug.dataset + window.__hungpvqDatasetDebug installed');
  return api;
}

function syncWindowAlias(target: DatasetDebugApi): void {
  if (typeof window !== 'undefined') {
    window[WINDOW_KEY] = target;
  }
}

export function uninstallDatasetDebug(): void {
  menuHooks.onUninstall?.();
  const bag = getMapDebugStore();
  delete bag.dataset;
  if (typeof window !== 'undefined' && window[WINDOW_KEY]) {
    delete window[WINDOW_KEY];
  }
  api = undefined;
  for (const key of Object.keys(vars)) delete vars[key];
  logger
    .with({ fn: 'uninstallDatasetDebug', span: 'cleanup' })
    .debug('map:debug.dataset uninstalled');
}

export function getDatasetDebugApi(): DatasetDebugApi | undefined {
  return (
    api ??
    getMapDebugStore().dataset ??
    (typeof window !== 'undefined' ? window[WINDOW_KEY] : undefined)
  );
}
