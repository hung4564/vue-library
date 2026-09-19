import { ensureMapMitt } from '@hungpvq/map-core';
import type { Emitter, EventType } from 'mitt';

/**
 * Get or create mitt event emitter for a map ID.
 * Prefer this name outside components/hooks when an imperative API is clearer.
 */
export function getMapMittStore<
  T extends Record<EventType, unknown> = Record<EventType, unknown>,
>(mapId: string): Emitter<T> {
  return ensureMapMitt<T>(mapId);
}

/** Parity alias with Vue `useMapMittStore` — use only in components / custom hooks. */
export const useMapMittStore = getMapMittStore;
