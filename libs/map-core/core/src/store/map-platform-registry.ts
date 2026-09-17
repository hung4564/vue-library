/**
 * Map platform accessors backed by UniversalRegistry global methods
 * (shared-store bag) so duplicate package copies share one wiring.
 */
import {
  UniversalRegistry,
  type RegistryFn,
} from '../registry/universal-registry';
import type { MapFCOnUseMap, MapSimple } from '../types';
import { MAP_PLATFORM_REGISTRY_METHOD } from './map-platform-keys';
import type { StoreCleanup } from './types';

export type MapAccessor = (
  mapId: string,
  cb?: MapFCOnUseMap,
) => MapSimple | undefined;

export type MapReadySubscriber = (
  mapId: string,
  cb: MapFCOnUseMap,
) => () => void;

export type MapStoreCleanupRegistrar = (
  mapId: string,
  key: string,
  cleanup: StoreCleanup,
) => void;

export function registerMapAccessor(fn: MapAccessor) {
  UniversalRegistry.registerMethod(
    MAP_PLATFORM_REGISTRY_METHOD.GET_MAP,
    fn as RegistryFn,
  );
}

export function registerMapReadySubscriber(fn: MapReadySubscriber) {
  UniversalRegistry.registerMethod(
    MAP_PLATFORM_REGISTRY_METHOD.SUBSCRIBE_MAP_READY,
    fn as RegistryFn,
  );
}

export function getMap(
  mapId: string,
  cb?: MapFCOnUseMap,
): MapSimple | undefined {
  const accessor = UniversalRegistry.getMethod(
    MAP_PLATFORM_REGISTRY_METHOD.GET_MAP,
  ) as MapAccessor | undefined;
  return accessor?.(mapId, cb);
}

/**
 * Subscribe to map READY (sync if live; wait otherwise; no-op when tombstoned).
 * Returns unsubscribe. No-op until an adapter registers via
 * `registerMapReadySubscriber`.
 */
export function subscribeMapReady(
  mapId: string,
  cb: MapFCOnUseMap,
): () => void {
  const subscribe = UniversalRegistry.getMethod(
    MAP_PLATFORM_REGISTRY_METHOD.SUBSCRIBE_MAP_READY,
  ) as MapReadySubscriber | undefined;
  return subscribe?.(mapId, cb) ?? (() => undefined);
}

/**
 * Register the adapter-backed cleanup registrar (called once from Vue/React store bootstrap).
 */
export function registerMapStoreCleanupRegistrar(fn: MapStoreCleanupRegistrar) {
  UniversalRegistry.registerMethod(
    MAP_PLATFORM_REGISTRY_METHOD.REGISTER_STORE_CLEANUP,
    fn as RegistryFn,
  );
}

/**
 * Register a map-scoped cleanup that runs on `removeMap` (or key destroy).
 * No-op until an adapter registers via `registerMapStoreCleanupRegistrar`.
 */
export function registerMapStoreCleanup(
  mapId: string,
  key: string,
  cleanup: StoreCleanup,
): void {
  const registrar = UniversalRegistry.getMethod(
    MAP_PLATFORM_REGISTRY_METHOD.REGISTER_STORE_CLEANUP,
  ) as MapStoreCleanupRegistrar | undefined;
  registrar?.(mapId, key, cleanup);
}
