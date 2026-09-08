import { UniversalRegistry } from '@hungpvq/map-core';
import type {
  IDataset,
  IIdentifyView,
  MenuConditionContext,
} from '../../interfaces';
import { findSiblingOrNearestLeaf } from '../../model/visitors';
import { IDENTIFY_RESULT_CONTROL } from './result';

/** IdentifyControl registry id + actions (must match useRegisterMapControl). */
export const IDENTIFY_CONTROL = {
  id: 'mapIdentifyControl',
  idResult: IDENTIFY_RESULT_CONTROL.id,
  /** Open/close identify session from a layer-item (one-way; does not subscribe scope). */
  actionSetScoped: 'setScoped',
  actionUseMapClick: 'useMapClick',
  actionUseBoxSelect: 'useBoxSelect',
  actionSetLayerFilter: 'setLayerFilter',
  actionClose: 'close',
  /** Sync toolbar / panel loading (e.g. from IdentifyShowFirstControl). */
  actionSetLoading: 'setLoading',
} as const;

/** Payload for `IDENTIFY_CONTROL.actionSetLayerFilter`. */
export type IdentifyLayerFilterPayload = {
  /** Empty / undefined = all layers. */
  identifyId?: string;
};

export type IdentifyScope = {
  listId?: string;
  identifyId?: string;
};

export type IdentifyScopeToggleResult = {
  active: boolean;
  identifyId?: string;
};

type IdentifyScopeListener = (scope: IdentifyScope) => void;

const scopes = new Map<string, IdentifyScope>();
const listeners = new Map<string, Set<IdentifyScopeListener>>();

function notify(mapId: string) {
  const scope = getIdentifyScope(mapId);
  const set = listeners.get(mapId);
  if (!set) return;
  for (const listener of set) {
    listener(scope);
  }
}

function writeIdentifyScope(mapId: string, scope: IdentifyScope | null): void {
  if (!scope?.listId || !scope.identifyId) {
    scopes.delete(mapId);
  } else {
    scopes.set(mapId, {
      listId: scope.listId,
      identifyId: scope.identifyId,
    });
  }
  notify(mapId);
}

export function getIdentifyScope(mapId: string): IdentifyScope {
  return scopes.get(mapId) ?? {};
}

export function clearIdentifyScope(mapId: string): void {
  writeIdentifyScope(mapId, null);
}

export function subscribeIdentifyScope(
  mapId: string,
  listener: IdentifyScopeListener,
): () => void {
  let set = listeners.get(mapId);
  if (!set) {
    set = new Set();
    listeners.set(mapId, set);
  }
  set.add(listener);
  listener(getIdentifyScope(mapId));
  return () => {
    set?.delete(listener);
    if (set && set.size === 0) {
      listeners.delete(mapId);
    }
  };
}

export function isListIdentifyActive(mapId: string, list: IDataset): boolean {
  const scope = getIdentifyScope(mapId);
  if (!scope.identifyId) return false;
  if (scope.listId === list.id) return true;
  const identify = findListIdentifyView(list);
  return !!identify && identify.id === scope.identifyId;
}

export function findListIdentifyView(
  layer: IDataset,
): (IDataset & IIdentifyView) | undefined {
  return findSiblingOrNearestLeaf(layer, (node) => node.type === 'identify') as
    (IDataset & IIdentifyView) | undefined;
}

/**
 * True when Identify-for-list should stay hidden:
 * no layer, no identify sibling, no `mapId`, or IdentifyControl not mounted.
 */
export function isIdentifyForListMenuHidden(
  ctx: MenuConditionContext,
): boolean {
  if (!ctx.layer) return true;
  if (!findListIdentifyView(ctx.layer as IDataset)) return true;
  if (!ctx.mapId) return true;
  return !UniversalRegistry.getControl(IDENTIFY_CONTROL.id, ctx.mapId);
}

/**
 * Toggle per-list identify active state (layer-item UI).
 * Caller should also notify IdentifyControl via
 * `runControlAction(mapId, IDENTIFY_CONTROL.id, IDENTIFY_CONTROL.actionSetScoped, result)`.
 */
export function toggleListIdentifyScope(
  mapId: string,
  list: IDataset,
): IdentifyScopeToggleResult {
  const identify = findListIdentifyView(list);
  if (!identify) {
    return { active: false };
  }

  const current = getIdentifyScope(mapId);
  if (current.listId === list.id && current.identifyId === identify.id) {
    clearIdentifyScope(mapId);
    return { active: false, identifyId: identify.id };
  }

  writeIdentifyScope(mapId, { listId: list.id, identifyId: identify.id });
  return { active: true, identifyId: identify.id };
}
