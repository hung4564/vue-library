import {
  createMapCoreMetaRegistry,
  type FallbackResolver,
} from '@hungpvq/map-core';

import { type IdentifyContext, identifyResolver } from './resolver';

const identifyResolverRegistry = createMapCoreMetaRegistry<
  FallbackResolver<IdentifyContext>
>({
  key: 'identify-resolver',
  createDefault: () => identifyResolver,
});

export function getGlobalIdentifyResolver(): FallbackResolver<IdentifyContext> {
  return identifyResolverRegistry.getDefault();
}

/** Replace the package-wide global identify UI resolver (`map:core:meta`). */
export function setGlobalIdentifyResolver(
  resolver: FallbackResolver<IdentifyContext>,
): void {
  identifyResolverRegistry.setDefault(resolver);
}

/**
 * Set or clear a per-map identify UI resolver on `map:core[mapId].resolver`.
 * `null` removes the override (falls back to default).
 */
export function setIdentifyResolver(
  mapId: string,
  resolver: FallbackResolver<IdentifyContext> | null,
): void {
  identifyResolverRegistry.set(mapId, resolver);
}

export function getIdentifyResolver(
  mapId: string,
): FallbackResolver<IdentifyContext> {
  return identifyResolverRegistry.get(mapId);
}
