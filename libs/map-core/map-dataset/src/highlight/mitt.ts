import { ensureMapMitt } from '@hungpvq/map-core';
import {
  clearHighlight,
  onDetailClose,
  onIdentifyClose,
  type HighlightSessionIntent,
} from '../identify/highlight-session';
import type { IDataset } from '../interfaces/dataset.base';

/**
 * Per-map mitt events for dataset UI lifecycle (Detail / Identify / AttributeTable)
 * and highlight clear. String values stay under `dataset:highlight:*` for protocol
 * stability; the const name is broader than paint FX alone.
 */
export const MAP_DATASET_EVENT = {
  CLEAR: 'dataset:highlight:clear',
  DETAIL_CLOSE: 'dataset:highlight:detail-close',
  IDENTIFY_CLOSE: 'dataset:highlight:identify-close',
  ATTRIBUTE_TABLE_CLOSE: 'dataset:highlight:attribute-table-close',
} as const;

export type HighlightClearTarget =
  | HighlightSessionIntent
  | { featureId: string | number }
  | 'identify-session';

/** Shared close payload — hosts attach `mapId` + `dataset` when known. */
export type MapDatasetClosePayload = {
  mapId: string;
  item?: unknown;
  dataset?: IDataset;
};

/** CLEAR payload — always includes `mapId`; `dataset` when the caller knows it. */
export type MapDatasetClearPayload = {
  mapId: string;
  target: HighlightClearTarget;
  dataset?: IDataset;
};

export type MapDatasetEvent = {
  [MAP_DATASET_EVENT.CLEAR]: MapDatasetClearPayload;
  [MAP_DATASET_EVENT.DETAIL_CLOSE]: MapDatasetClosePayload;
  [MAP_DATASET_EVENT.IDENTIFY_CLOSE]: MapDatasetClosePayload;
  [MAP_DATASET_EVENT.ATTRIBUTE_TABLE_CLOSE]: MapDatasetClosePayload;
};

type BridgeHandlers = {
  onClear: (payload: MapDatasetClearPayload) => void;
  onDetailClose: (payload: MapDatasetClosePayload) => void;
  onIdentifyClose: (payload: MapDatasetClosePayload) => void;
  onAttributeTableClose: (payload: MapDatasetClosePayload) => void;
};

const bridges = new Map<string, BridgeHandlers>();
/** Active consumers of the bridge (hosts + controller). */
const bridgeRefs = new Map<string, number>();

function bindHandlers(mapId: string): void {
  if (bridges.has(mapId)) return;

  const emitter = ensureMapMitt<MapDatasetEvent>(mapId);
  const handlers: BridgeHandlers = {
    onClear: (payload) => clearHighlight(mapId, payload.target),
    onDetailClose: (payload) => onDetailClose(mapId, payload?.item),
    onIdentifyClose: () => onIdentifyClose(mapId),
    onAttributeTableClose: () => clearHighlight(mapId, 'attribute-table'),
  };

  emitter.on(MAP_DATASET_EVENT.CLEAR, handlers.onClear);
  emitter.on(MAP_DATASET_EVENT.DETAIL_CLOSE, handlers.onDetailClose);
  emitter.on(MAP_DATASET_EVENT.IDENTIFY_CLOSE, handlers.onIdentifyClose);
  emitter.on(
    MAP_DATASET_EVENT.ATTRIBUTE_TABLE_CLOSE,
    handlers.onAttributeTableClose,
  );
  bridges.set(mapId, handlers);
}

function unbindHandlers(mapId: string): void {
  const handlers = bridges.get(mapId);
  if (!handlers) return;
  const emitter = ensureMapMitt<MapDatasetEvent>(mapId);
  emitter.off(MAP_DATASET_EVENT.CLEAR, handlers.onClear);
  emitter.off(MAP_DATASET_EVENT.DETAIL_CLOSE, handlers.onDetailClose);
  emitter.off(MAP_DATASET_EVENT.IDENTIFY_CLOSE, handlers.onIdentifyClose);
  emitter.off(
    MAP_DATASET_EVENT.ATTRIBUTE_TABLE_CLOSE,
    handlers.onAttributeTableClose,
  );
  bridges.delete(mapId);
}

/**
 * Bind map mitt → highlight session (ref-counted).
 * Pair with {@link releaseHighlightMittBridge} / {@link bindHighlightMittBridge}.
 */
export function ensureHighlightMittBridge(mapId: string): void {
  const next = (bridgeRefs.get(mapId) ?? 0) + 1;
  bridgeRefs.set(mapId, next);
  bindHandlers(mapId);
}

/**
 * Release one consumer ref. Unbinds mitt listeners when the last consumer leaves.
 */
export function releaseHighlightMittBridge(mapId: string): void {
  const cur = bridgeRefs.get(mapId) ?? 0;
  if (cur <= 1) {
    bridgeRefs.delete(mapId);
    unbindHandlers(mapId);
    return;
  }
  bridgeRefs.set(mapId, cur - 1);
}

/**
 * Ensure bridge and return a disposer (call on host unmount).
 * Same pattern as map-draw `emit.on` + `emit.off` on unmount.
 */
export function bindHighlightMittBridge(mapId: string): () => void {
  ensureHighlightMittBridge(mapId);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    releaseHighlightMittBridge(mapId);
  };
}

/**
 * Force-unbind listeners and reset refs (map / controller teardown).
 * Alias: {@link cleanHighlightMittBridge}.
 */
export function destroyHighlightMittBridge(mapId: string): void {
  bridgeRefs.delete(mapId);
  unbindHandlers(mapId);
}

/** @see destroyHighlightMittBridge */
export const cleanHighlightMittBridge = destroyHighlightMittBridge;

export function emitHighlightClear(
  mapId: string,
  target: HighlightClearTarget,
  options: Omit<MapDatasetClearPayload, 'mapId' | 'target'> = {},
): void {
  ensureHighlightMittBridge(mapId);
  ensureMapMitt<MapDatasetEvent>(mapId).emit(MAP_DATASET_EVENT.CLEAR, {
    mapId,
    target,
    ...options,
  });
  releaseHighlightMittBridge(mapId);
}

export function emitHighlightDetailClose(
  mapId: string,
  payload: Omit<MapDatasetClosePayload, 'mapId'> = {},
): void {
  ensureHighlightMittBridge(mapId);
  ensureMapMitt<MapDatasetEvent>(mapId).emit(MAP_DATASET_EVENT.DETAIL_CLOSE, {
    ...payload,
    mapId,
  });
  releaseHighlightMittBridge(mapId);
}

export function emitHighlightIdentifyClose(
  mapId: string,
  payload: Omit<MapDatasetClosePayload, 'mapId'> = {},
): void {
  ensureHighlightMittBridge(mapId);
  ensureMapMitt<MapDatasetEvent>(mapId).emit(MAP_DATASET_EVENT.IDENTIFY_CLOSE, {
    ...payload,
    mapId,
  });
  releaseHighlightMittBridge(mapId);
}

export function emitHighlightAttributeTableClose(
  mapId: string,
  payload: Omit<MapDatasetClosePayload, 'mapId'> = {},
): void {
  ensureHighlightMittBridge(mapId);
  ensureMapMitt<MapDatasetEvent>(mapId).emit(
    MAP_DATASET_EVENT.ATTRIBUTE_TABLE_CLOSE,
    { ...payload, mapId },
  );
  releaseHighlightMittBridge(mapId);
}
