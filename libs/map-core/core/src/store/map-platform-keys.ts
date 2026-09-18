/**
 * Reserved UniversalRegistry global method keys for map platform wiring.
 * These live in the global bag only — `clearMap` must not remove them.
 */
export const MAP_PLATFORM_REGISTRY_METHOD = {
  GET_MAP: '__platform.getMap',
  SUBSCRIBE_MAP_READY: '__platform.subscribeMapReady',
  REGISTER_STORE_CLEANUP: '__platform.registerStoreCleanup',
} as const;

export type MapPlatformRegistryMethod =
  (typeof MAP_PLATFORM_REGISTRY_METHOD)[keyof typeof MAP_PLATFORM_REGISTRY_METHOD];
