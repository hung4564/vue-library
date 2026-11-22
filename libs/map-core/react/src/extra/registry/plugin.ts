/* Dynamic registry: components are registered at runtime with heterogeneous props. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { UniversalRegistry as CoreUniversalRegistry } from '@hungpvq/map-core';
import type { ComponentType } from 'react';

/**
 * React UniversalRegistry — same storage as core (`@hungpvq/shared-store`).
 * Only adds typed components; no separate Map bag outside shared-store.
 */
export class UniversalRegistry extends CoreUniversalRegistry {
  static registerComponent(key: string, comp: ComponentType<any>) {
    super.registerComponent(key, comp);
  }

  static registerComponentForMap(
    mapId: string,
    key: string,
    comp: ComponentType<any>,
  ) {
    super.registerComponentForMap(mapId, key, comp);
  }

  static getComponent(
    key: string,
    mapId?: string,
  ): ComponentType<any> | undefined {
    return super.getComponent(key, mapId) as ComponentType<any> | undefined;
  }
}

export function useUniversalRegistry(mapId?: string) {
  return {
    getComponent(key: string, defaultValue?: ComponentType<any>) {
      return UniversalRegistry.getComponent(key, mapId) || defaultValue;
    },
  };
}
