import type { IdentifyMultiResult } from '../interfaces/dataset.parts';
import { LIST_VIEW_MENU_ID } from '../menu/items';
import type { IListViewUI } from '../model/list/types';
import { findSiblingOrNearestLeaf } from '../model/visitors/helpers';
import { isListView } from '../utils/check';

/** Per-identify hit UI policy (builder / config). */
export type IdentifyHitAction = 'detail' | 'table' | 'result' | 'auto';

/** Effective action after resolving `auto` and availability. */
export type IdentifyResolvedHitAction = 'detail' | 'table' | 'result';

/** Minimal context for hit-action resolution (avoids circular import with resolver). */
export type IdentifyHitActionContext = {
  records: IdentifyMultiResult[];
  total?: number;
  singleLayer?: boolean;
  signal?: AbortSignal;
};

export function countIdentifyMultiFeatures(
  results: IdentifyMultiResult[],
): number {
  let total = 0;
  for (const result of results) {
    total += result.features?.length ?? 0;
  }
  return total;
}

export function getFirstIdentifyMultiFeature(results: IdentifyMultiResult[]) {
  for (const result of results) {
    const feature = result.features?.[0];
    if (feature) {
      return { identify: result.identify, feature };
    }
  }
  return undefined;
}

export function getAttributeTableTarget(records: IdentifyMultiResult[]) {
  const first = records[0];
  if (!first) return undefined;
  const list = findSiblingOrNearestLeaf<IListViewUI>(
    first.identify,
    isListView,
  );
  if (!list) return undefined;
  const menu = list.getMenu(LIST_VIEW_MENU_ID.layer.attributeTable);
  if (!menu) return undefined;
  return { list, features: first.features, menu };
}

function isIdentifyContextAborted(ctx: IdentifyHitActionContext): boolean {
  return !!ctx.signal?.aborted;
}

function canOpenIdentifyShowDetail(ctx: IdentifyHitActionContext): boolean {
  if (isIdentifyContextAborted(ctx)) return false;
  if (!(ctx.total && ctx.total > 0)) return false;
  const first = getFirstIdentifyMultiFeature(ctx.records);
  return !!first?.identify.hasMenu(LIST_VIEW_MENU_ID.item.showDetail);
}

function canOpenIdentifyAttributeTable(ctx: IdentifyHitActionContext): boolean {
  if (isIdentifyContextAborted(ctx)) return false;
  if (!(ctx.total && ctx.total > 0)) return false;
  return !!getAttributeTableTarget(ctx.records);
}

/**
 * Auto path: exactly one feature + show-detail menu.
 * Scoped filter (`singleLayer`) OR a single identify record with hits.
 */
export function shouldOpenIdentifyShowDetail(
  ctx: IdentifyHitActionContext,
): boolean {
  if (isIdentifyContextAborted(ctx)) return false;
  const { total, records, singleLayer } = ctx;
  if (total !== 1) return false;
  if (!(singleLayer || records.length === 1)) return false;
  const first = getFirstIdentifyMultiFeature(records);
  return !!first?.identify.hasMenu(LIST_VIEW_MENU_ID.item.showDetail);
}

/**
 * Auto path: one identify node with hits + attribute-table menu.
 * Does not require the Identify layer filter to be scoped — a newly created
 * World Cities sample under "All layers" still opens the table when it is the
 * only layer that returned features.
 */
export function shouldOpenIdentifyAttributeTable(
  ctx: IdentifyHitActionContext,
): boolean {
  if (isIdentifyContextAborted(ctx)) return false;
  const { total, records } = ctx;
  return (
    records.length === 1 &&
    !!total &&
    !!getAttributeTableTarget(records)
  );
}

/** Map `auto` (and unavailable explicit actions) to detail | table | result. */
export function resolveAutoIdentifyHitAction(
  ctx: IdentifyHitActionContext,
): IdentifyResolvedHitAction {
  if (shouldOpenIdentifyShowDetail(ctx)) return 'detail';
  if (shouldOpenIdentifyAttributeTable(ctx)) return 'table';
  return 'result';
}

function configuredHitAction(ctx: IdentifyHitActionContext): IdentifyHitAction {
  const total = ctx.total ?? 0;
  const first = ctx.records[0];
  const config = first?.identify.config;
  if (total <= 1) {
    return config?.onSingle ?? 'auto';
  }
  return config?.onMultiple ?? 'auto';
}

/**
 * Resolve UI policy for this identify run.
 * Order: onSingle/onMultiple from first hit → auto.
 * Explicit detail/table fall back to auto when menus are missing.
 */
export function resolveIdentifyHitAction(
  ctx: IdentifyHitActionContext,
): IdentifyResolvedHitAction {
  if (isIdentifyContextAborted(ctx)) return 'result';
  if (!(ctx.total && ctx.total > 0)) return 'result';

  const configured = configuredHitAction(ctx);
  if (configured === 'result') return 'result';
  if (configured === 'detail') {
    return canOpenIdentifyShowDetail(ctx)
      ? 'detail'
      : resolveAutoIdentifyHitAction(ctx);
  }
  if (configured === 'table') {
    return canOpenIdentifyAttributeTable(ctx)
      ? 'table'
      : resolveAutoIdentifyHitAction(ctx);
  }
  return resolveAutoIdentifyHitAction(ctx);
}
