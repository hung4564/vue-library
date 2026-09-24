import type { IDataset } from '@hungpvq/map-dataset';
import { findPartByType } from '@hungpvq/map-dataset';
import {
  createMenuConditionContext,
  getEffectiveMenuItemLocation,
  getGlobalDatasetMenus,
  getItemMenuHost,
  getLayerMenuHost,
  getResolvedMenus,
  handleMenuAction,
  isMenuItemDisabled,
  isMenuItemHidden,
  MENU_CONTROL_ID,
  type MenuAction,
  type MenuConditionContext,
  type PartitionedMenuActions,
  partitionMenuActions,
} from '@hungpvq/map-dataset/menu';

import type {
  DatasetMenuTarget,
  ExplainStep,
  MenuInspectDetail,
  MenuSourceKind,
  MenuSummary,
  PartitionedMenuSummary,
} from './types';

type MenuMeta = {
  source: MenuSourceKind;
  sourceLabel: string;
  hostType?: string;
  hostId?: string;
};

type MenuItemFields = MenuAction & {
  name?: string;
  icon?: string;
  componentKey?: string;
  location?: string;
  order?: number;
  byControl?: Record<string, unknown>;
  click?: unknown;
};

function readItemFields(menu: MenuAction): MenuItemFields {
  return menu as MenuItemFields;
}

function getLocalMenus(dataset: IDataset | undefined): MenuAction[] {
  if (!dataset) return [];
  const helper = dataset as IDataset & { getMenus?: () => MenuAction[] };
  if (typeof helper.getMenus !== 'function') return [];
  return helper.getMenus() ?? [];
}

function menuPartMenus(
  dataset: IDataset,
  target: DatasetMenuTarget,
): MenuAction[] {
  const part = findPartByType(dataset, 'menu') as
    (IDataset & { getData?: () => unknown }) | undefined;
  const entries = part?.getData?.();
  if (!Array.isArray(entries)) return [];
  const out: MenuAction[] = [];
  for (const entry of entries) {
    if (!entry || entry.for !== target) continue;
    const menu = entry.menu as MenuAction | undefined;
    if (!menu) continue;
    const id = menu.id ?? entry.key;
    out.push(id ? { ...menu, id } : menu);
  }
  return out;
}

/** Identity fingerprint that ignores location/hidden (placement may clone + change those). */
function menuIdentityFingerprint(menu: MenuAction): string {
  const fields = readItemFields(menu);
  return [
    menu.id ?? '',
    menu.type,
    fields.name ?? '',
    fields.componentKey ?? '',
    String(fields.order ?? ''),
    fields.icon ?? '',
    typeof fields.click === 'function' ? 'fn' : fields.click ? 'click' : '',
  ].join('\0');
}

function slugPart(value: string | number | undefined): string {
  if (value == null || value === '') return '';
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
}

/**
 * Stable debug id/key: real `menu.id` when present, else a generated
 * `anon:<slug>:<resolvedIndex>` (debug-only — does not mutate the menu).
 */
export function menuDebugKey(menu: MenuAction, resolvedIndex: number): string {
  if (menu.id) return menu.id;
  const fields = readItemFields(menu);
  const parts = [
    slugPart(menu.type),
    slugPart(fields.name),
    slugPart(fields.componentKey),
    slugPart(fields.location),
  ].filter(Boolean);
  const base = parts.join('-') || 'menu';
  return `anon:${base}:${resolvedIndex}`;
}

/** Resolve index in getResolvedMenus() list (placement clones break indexOf). */
function indexInResolvedMenus(
  resolvedMenus: MenuAction[],
  item: MenuAction,
): number {
  if (item.id) {
    const byId = resolvedMenus.findIndex((m) => m.id === item.id);
    if (byId >= 0) return byId;
  }
  const direct = resolvedMenus.indexOf(item);
  if (direct >= 0) return direct;
  const fp = menuIdentityFingerprint(item);
  return resolvedMenus.findIndex((m) => menuIdentityFingerprint(m) === fp);
}

type MenuSourceIndex = {
  byId: Map<string, MenuMeta>;
  byFingerprint: Map<string, MenuMeta>;
};

function buildSourceIndex(
  dataset: IDataset,
  target: DatasetMenuTarget,
): MenuSourceIndex {
  const partMenus = menuPartMenus(dataset, target);
  const localHost =
    target === 'item' ? getItemMenuHost(dataset) : getLayerMenuHost(dataset);
  const localMenus = getLocalMenus(localHost);
  const globalMenus = getGlobalDatasetMenus(target);

  const byId = new Map<string, MenuMeta>();
  const byFingerprint = new Map<string, MenuMeta>();

  const put = (menu: MenuAction, meta: MenuMeta) => {
    if (menu.id) byId.set(menu.id, meta);
    // Ignore location/hidden so byControl clones still match local/global/part.
    byFingerprint.set(menuIdentityFingerprint(menu), meta);
  };

  // Prefer most-specific override: local > menu-part > global (write order).
  for (const m of globalMenus) {
    put(m, {
      source: 'global',
      sourceLabel: 'registerGlobalDatasetMenus()',
    });
  }
  for (const m of partMenus) {
    put(m, {
      source: 'menu-part',
      sourceLabel: 'dataset menu part (getData)',
      hostType: 'menu',
      hostId: findPartByType(dataset, 'menu')?.id,
    });
  }
  for (const m of localMenus) {
    put(m, {
      source: 'local',
      sourceLabel: `local getMenus() on ${localHost?.type ?? 'host'}`,
      hostType: localHost?.type,
      hostId: localHost?.id,
    });
  }

  return { byId, byFingerprint };
}

function sourceFor(menu: MenuAction, index: MenuSourceIndex): MenuMeta {
  if (menu.id && index.byId.has(menu.id)) {
    return index.byId.get(menu.id)!;
  }
  const fp = menuIdentityFingerprint(menu);
  if (index.byFingerprint.has(fp)) {
    return index.byFingerprint.get(fp)!;
  }
  return {
    source: 'unknown',
    sourceLabel: 'not matched to global / menu-part / local',
  };
}

function summarizeItem(
  menu: MenuAction,
  ctx: MenuConditionContext,
  index: MenuSourceIndex,
  options: { control?: string; target?: DatasetMenuTarget },
  resolvedIndex: number,
): MenuSummary {
  const fields = readItemFields(menu);
  const meta = sourceFor(menu, index);
  const byControl = fields.byControl;
  const byControlKeys = byControl ? Object.keys(byControl) : [];
  const effectiveLocation = getEffectiveMenuItemLocation(menu, ctx);
  const key = menuDebugKey(menu, resolvedIndex);
  const idGenerated = !menu.id;
  return {
    key,
    /** Always set: real id, or generated `anon:…` for debug select/inspect. */
    id: key,
    idGenerated,
    name: fields.name,
    type: menu.type,
    order: fields.order,
    location: fields.location,
    effectiveLocation,
    hidden: isMenuItemHidden(menu, ctx),
    disabled: isMenuItemDisabled(menu, ctx),
    hasClick: menu.type === 'item' && Boolean(fields.click),
    icon: fields.icon,
    componentKey: fields.componentKey,
    source: meta.source,
    sourceLabel: meta.sourceLabel,
    hostType: meta.hostType,
    hostId: meta.hostId,
    byControlKeys,
    control:
      typeof ctx.context?.['control'] === 'string'
        ? String(ctx.context['control'])
        : options.control,
    target: options.target,
  };
}

function summarizePartition(
  partitioned: PartitionedMenuActions,
  ctx: MenuConditionContext,
  index: MenuSourceIndex,
  options: { control?: string; target?: DatasetMenuTarget },
  resolvedMenus: MenuAction[],
): PartitionedMenuSummary {
  const usedIndexes = new Set<number>();
  const map = (bucket: MenuAction[]) =>
    bucket.map((m) => {
      let resolvedIndex = indexInResolvedMenus(resolvedMenus, m);
      // Disambiguate multiple anon items that share the same identity fingerprint.
      if (
        resolvedIndex >= 0 &&
        !m.id &&
        usedIndexes.has(resolvedIndex) &&
        resolvedMenus.length
      ) {
        const fp = menuIdentityFingerprint(m);
        const next = resolvedMenus.findIndex(
          (candidate, i) =>
            !usedIndexes.has(i) && menuIdentityFingerprint(candidate) === fp,
        );
        if (next >= 0) resolvedIndex = next;
      }
      if (resolvedIndex < 0) resolvedIndex = 0;
      usedIndexes.add(resolvedIndex);
      return summarizeItem(m, ctx, index, options, resolvedIndex);
    });
  return {
    extra: map(partitioned.extra),
    menu: map(partitioned.menu),
    bottom: map(partitioned.bottom),
    prebottom: map(partitioned.prebottom),
    title: map(partitioned.title),
  };
}

export function resolveAndPartitionMenus(
  dataset: IDataset,
  options: {
    mapId?: string;
    control?: string;
    target?: DatasetMenuTarget;
  },
): {
  menus: MenuAction[];
  partitioned: PartitionedMenuActions;
  summary: PartitionedMenuSummary;
  ctx: MenuConditionContext;
  sourceIndex: MenuSourceIndex;
} {
  const target = options.target ?? 'layer';
  const control = options.control ?? MENU_CONTROL_ID.layerControl;
  const menus = getResolvedMenus(dataset, target);
  const ctx = createMenuConditionContext(dataset, {
    mapId: options.mapId,
    context: [{ control }],
  });
  const partitioned = partitionMenuActions(menus, ctx);
  const sourceIndex = buildSourceIndex(dataset, target);
  return {
    menus,
    partitioned,
    summary: summarizePartition(
      partitioned,
      ctx,
      sourceIndex,
      {
        control,
        target,
      },
      menus,
    ),
    ctx,
    sourceIndex,
  };
}

export function explainMenus(
  dataset: IDataset,
  options: {
    mapId?: string;
    control?: string;
    target?: DatasetMenuTarget;
  },
): ExplainStep[] {
  const target = options.target ?? 'layer';
  const control = options.control ?? MENU_CONTROL_ID.layerControl;
  const steps: ExplainStep[] = [];
  let step = 0;
  const push = (message: string, detail?: Record<string, unknown>) => {
    step += 1;
    steps.push({ step, message, detail });
  };

  push('Resolve menus via getResolvedMenus', { target });
  const menus = getResolvedMenus(dataset, target);
  push('Merged default (menu part for target) + local getMenus()', {
    count: menus.length,
    ids: menus.map((m) => m.id).filter(Boolean),
  });

  const ctx = createMenuConditionContext(dataset, {
    mapId: options.mapId,
    context: [{ control }],
  });
  push('Build MenuConditionContext', { mapId: options.mapId, control });

  const partitioned = partitionMenuActions(menus, ctx);
  push('Apply byControl placement, filter hidden, bucket by location', {
    title: partitioned.title.map((m) => m.id),
    extra: partitioned.extra.map((m) => m.id),
    menu: partitioned.menu.map((m) => m.id),
    bottom: partitioned.bottom.map((m) => m.id),
    prebottom: partitioned.prebottom.map((m) => m.id),
  });

  return steps;
}

export function findMenuInResolved(
  menus: MenuAction[],
  menuIdOrKey: string,
): MenuAction | undefined {
  if (!menuIdOrKey) return undefined;
  const byId = menus.find((m) => m.id === menuIdOrKey);
  if (byId) return byId;
  const anon = /^anon:(.*):(\d+)$/.exec(menuIdOrKey);
  if (anon) {
    const i = Number(anon[2]);
    if (Number.isFinite(i) && menus[i]) return menus[i];
  }
  return menus.find((m, i) => menuDebugKey(m, i) === menuIdOrKey);
}

export function inspectMenuAction(
  menu: MenuAction,
  ctx: MenuConditionContext,
  options?: {
    dataset?: IDataset;
    control?: string;
    target?: DatasetMenuTarget;
    sourceIndex?: MenuSourceIndex;
    resolvedIndex?: number;
  },
): MenuInspectDetail {
  const dataset: IDataset = options?.dataset ?? ctx.layer;
  const target = options?.target ?? 'layer';
  const control =
    options?.control ??
    (typeof ctx.context?.['control'] === 'string'
      ? String(ctx.context['control'])
      : undefined);
  const index = options?.sourceIndex ?? buildSourceIndex(dataset, target);
  const resolvedIndex = options?.resolvedIndex ?? 0;
  const summary = summarizeItem(
    menu,
    ctx,
    index,
    { control, target },
    resolvedIndex,
  );
  const fields = readItemFields(menu);
  return {
    key: summary.key,
    id: summary.id,
    idGenerated: summary.idGenerated,
    name: fields.name,
    type: menu.type,
    summary,
    location: fields.location,
    effectiveLocation: summary.effectiveLocation ?? 'extra',
    order: fields.order,
    icon: fields.icon,
    componentKey: fields.componentKey,
    byControl: fields.byControl,
    byControlKeys: summary.byControlKeys,
    hasClick: summary.hasClick,
    source: summary.source,
    sourceLabel: summary.sourceLabel,
    hostType: summary.hostType,
    hostId: summary.hostId,
    control: summary.control,
    target: summary.target,
    datasetId: dataset.id,
    datasetName: dataset.getName(),
    datasetType: dataset.type,
    rawKeys: Object.keys(menu as object),
  };
}

export function invokeResolvedMenu(
  menu: MenuAction,
  props: {
    mapId: string;
    layer: IDataset;
    control?: string;
    value?: unknown;
    meta?: Record<string, unknown>;
  },
): void {
  handleMenuAction(menu, {
    mapId: props.mapId,
    layer: props.layer,
    value: props.value,
    meta: props.meta,
    context: props.control ? { control: props.control } : undefined,
  });
}

export { MENU_CONTROL_ID, summarizePartition };
