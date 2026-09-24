/**
 * Map platform accessors backed by UniversalRegistry global methods
 * (shared-store bag) so duplicate package copies share one wiring.
 *
 * Multiple framework hosts (`hostId`) can register without silently
 * clobbering each other: `getMap` / READY fan out across hosts.
 * Re-registering the same `hostId` replaces that host (version bump).
 */
import {
  type RegistryFn,
  UniversalRegistry,
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

/** Well-known platform host ids (adapters should pass these). */
export const MAP_PLATFORM_HOST = {
  DEFAULT: 'default',
  VUE_MAP_CORE: 'vue-map-core',
  REACT_MAP_CORE: 'react-map-core',
} as const;

export type MapPlatformHostId =
  | (typeof MAP_PLATFORM_HOST)[keyof typeof MAP_PLATFORM_HOST]
  | (string & NonNullable<unknown>);

export type RegisterMapPlatformOptions = {
  /**
   * Isolates this wiring from other hosts. Same id replaces that host only.
   * @default MAP_PLATFORM_HOST.DEFAULT
   */
  hostId?: MapPlatformHostId;
};

export type MapPlatformRegistration = {
  hostId: string;
  /** Monotonic version for this host after the registration. */
  version: number;
  /** Remove this host's contribution (no-op if already replaced). */
  unregister: () => void;
};

type HostBag = {
  hostId: string;
  version: number;
  getMap?: MapAccessor;
  subscribeReady?: MapReadySubscriber;
  registerCleanup?: MapStoreCleanupRegistrar;
  /** Token for the last register* call so unregister is precise. */
  getMapToken?: object;
  subscribeReadyToken?: object;
  registerCleanupToken?: object;
};

const hosts = new Map<string, HostBag>();
let versionSeq = 0;

function ensureHost(hostId: string): HostBag {
  let host = hosts.get(hostId);
  if (!host) {
    host = { hostId, version: 0 };
    hosts.set(hostId, host);
  }
  return host;
}

function pruneHost(host: HostBag) {
  if (!host.getMap && !host.subscribeReady && !host.registerCleanup) {
    hosts.delete(host.hostId);
  }
}

function bumpHost(host: HostBag): number {
  host.version = ++versionSeq;
  return host.version;
}

function hostList(): HostBag[] {
  return [...hosts.values()];
}

function compositeGetMap(
  mapId: string,
  cb?: MapFCOnUseMap,
): MapSimple | undefined {
  for (const host of hostList()) {
    const accessor = host.getMap;
    if (!accessor) continue;
    const map = accessor(mapId);
    if (map) {
      cb?.(map);
      return map;
    }
  }
  if (cb) {
    compositeSubscribeMapReady(mapId, cb);
  }
  return undefined;
}

function compositeSubscribeMapReady(
  mapId: string,
  cb: MapFCOnUseMap,
): () => void {
  let done = false;
  const unsubs: Array<() => void> = [];
  for (const host of hostList()) {
    const subscribe = host.subscribeReady;
    if (!subscribe) continue;
    unsubs.push(
      subscribe(mapId, (map) => {
        if (done) return;
        done = true;
        for (const u of unsubs) u();
        cb(map);
      }),
    );
  }
  return () => {
    done = true;
    for (const u of unsubs) u();
  };
}

function compositeRegisterCleanup(
  mapId: string,
  key: string,
  cleanup: StoreCleanup,
): void {
  for (const host of hostList()) {
    host.registerCleanup?.(mapId, key, cleanup);
  }
}

function syncCompositeMethods() {
  const hasGetMap = hostList().some((h) => h.getMap);
  const hasReady = hostList().some((h) => h.subscribeReady);
  const hasCleanup = hostList().some((h) => h.registerCleanup);

  if (hasGetMap) {
    UniversalRegistry.registerMethod(
      MAP_PLATFORM_REGISTRY_METHOD.GET_MAP,
      compositeGetMap as RegistryFn,
    );
  }
  if (hasReady) {
    UniversalRegistry.registerMethod(
      MAP_PLATFORM_REGISTRY_METHOD.SUBSCRIBE_MAP_READY,
      compositeSubscribeMapReady as RegistryFn,
    );
  }
  if (hasCleanup) {
    UniversalRegistry.registerMethod(
      MAP_PLATFORM_REGISTRY_METHOD.REGISTER_STORE_CLEANUP,
      compositeRegisterCleanup as RegistryFn,
    );
  }
}

function resolveHostId(options?: RegisterMapPlatformOptions): string {
  const id = options?.hostId?.trim();
  return id || MAP_PLATFORM_HOST.DEFAULT;
}

/**
 * Register (or replace) a host's `getMap` wiring.
 * Returns `{ unregister }` — calling it removes only this registration
 * when it is still the active one for `hostId`.
 */
export function registerMapAccessor(
  fn: MapAccessor,
  options?: RegisterMapPlatformOptions,
): MapPlatformRegistration {
  const hostId = resolveHostId(options);
  const host = ensureHost(hostId);
  const token = {};
  host.getMap = fn;
  host.getMapToken = token;
  const version = bumpHost(host);
  syncCompositeMethods();
  return {
    hostId,
    version,
    unregister: () => {
      const current = hosts.get(hostId);
      if (!current || current.getMapToken !== token) return;
      current.getMap = undefined;
      current.getMapToken = undefined;
      pruneHost(current);
      syncCompositeMethods();
    },
  };
}

export function registerMapReadySubscriber(
  fn: MapReadySubscriber,
  options?: RegisterMapPlatformOptions,
): MapPlatformRegistration {
  const hostId = resolveHostId(options);
  const host = ensureHost(hostId);
  const token = {};
  host.subscribeReady = fn;
  host.subscribeReadyToken = token;
  const version = bumpHost(host);
  syncCompositeMethods();
  return {
    hostId,
    version,
    unregister: () => {
      const current = hosts.get(hostId);
      if (!current || current.subscribeReadyToken !== token) return;
      current.subscribeReady = undefined;
      current.subscribeReadyToken = undefined;
      pruneHost(current);
      syncCompositeMethods();
    },
  };
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
export function registerMapStoreCleanupRegistrar(
  fn: MapStoreCleanupRegistrar,
  options?: RegisterMapPlatformOptions,
): MapPlatformRegistration {
  const hostId = resolveHostId(options);
  const host = ensureHost(hostId);
  const token = {};
  host.registerCleanup = fn;
  host.registerCleanupToken = token;
  const version = bumpHost(host);
  syncCompositeMethods();
  return {
    hostId,
    version,
    unregister: () => {
      const current = hosts.get(hostId);
      if (!current || current.registerCleanupToken !== token) return;
      current.registerCleanup = undefined;
      current.registerCleanupToken = undefined;
      pruneHost(current);
      syncCompositeMethods();
    },
  };
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

/** Debug / tests: active platform hosts (newest registration order not guaranteed). */
export function listMapPlatformHosts(): ReadonlyArray<{
  hostId: string;
  version: number;
  hasGetMap: boolean;
  hasSubscribeReady: boolean;
  hasRegisterCleanup: boolean;
}> {
  return hostList().map((h) => ({
    hostId: h.hostId,
    version: h.version,
    hasGetMap: !!h.getMap,
    hasSubscribeReady: !!h.subscribeReady,
    hasRegisterCleanup: !!h.registerCleanup,
  }));
}

/** Test helper: clear all host wiring (does not wipe other UniversalRegistry methods). */
export function resetMapPlatformHostsForTests(): void {
  hosts.clear();
  versionSeq = 0;
}
