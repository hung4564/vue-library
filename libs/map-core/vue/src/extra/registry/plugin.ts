import { UniversalRegistry as CoreUniversalRegistry } from '@hungpvq/map-core';
import type { Component } from 'vue';
import { markRaw } from 'vue';

/**
 * Vue UniversalRegistry — same storage as core (`@hungpvq/shared-store`).
 * Only adds typed components + `markRaw` so Vue does not make them reactive.
 */
export class UniversalRegistry extends CoreUniversalRegistry {
  static registerComponent(key: string, comp: Component) {
    super.registerComponent(key, markRaw(comp));
  }

  static registerComponentForMap(mapId: string, key: string, comp: Component) {
    super.registerComponentForMap(mapId, key, markRaw(comp));
  }

  static getComponent(key: string, mapId?: string): Component | undefined {
    return super.getComponent(key, mapId) as Component | undefined;
  }
}

export function useUniversalRegistry(mapId?: string) {
  return {
    getComponent(key: string, defaultValue?: Component): Component | undefined {
      return UniversalRegistry.getComponent(key, mapId) || defaultValue;
    },
  };
}
