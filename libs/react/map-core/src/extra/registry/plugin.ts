/* Dynamic registry: components are registered at runtime with heterogeneous props. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  logHelper,
  MAP_STORE_KEY,
  REGISTRY_GLOBAL_STORE_KEY,
  REGISTRY_NAMESPACES,
  UniversalRegistry as CoreUniversalRegistry,
  type RegistryNamespaceKind,
} from '@hungpvq/map-core';
import { createStore } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import type { ComponentType } from 'react';
import { createMapScopedStore } from '../../store';

const logger = loggerFactory.createLogger().setNamespace('map:registry', 2);
const KEY = MAP_STORE_KEY.REGISTRY;

function getMapRegistryStore(mapId: string) {
  return createMapScopedStore<Map<string, ComponentType<any>>>(mapId, KEY, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return new Map<string, ComponentType<any>>();
  });
}

export class UniversalRegistry extends CoreUniversalRegistry {
  private static globalRegistry = createStore<Map<string, ComponentType<any>>>(
    REGISTRY_GLOBAL_STORE_KEY,
    new Map<string, ComponentType<any>>(),
  );

  static registerComponent(key: string, comp: ComponentType<any>) {
    this.globalRegistry.set(REGISTRY_NAMESPACES.COMPONENT + key, comp);
  }

  static registerComponentForMap(
    mapId: string,
    key: string,
    comp: ComponentType<any>,
  ) {
    const namespacedKey = REGISTRY_NAMESPACES.COMPONENT + key;
    const mapRegistry = getMapRegistryStore(mapId);
    if (mapRegistry.has(namespacedKey)) {
      logHelper(logger, mapId, 'registry').warn(
        `Key '${namespacedKey}' already exists for map ${mapId}, overwriting`,
      );
    }
    mapRegistry.set(namespacedKey, comp);
  }

  static getComponent(
    key: string,
    mapId?: string,
  ): ComponentType<any> | undefined {
    const namespacedKey = REGISTRY_NAMESPACES.COMPONENT + key;
    if (mapId) {
      const mapRegistry = getMapRegistryStore(mapId);
      if (mapRegistry.has(namespacedKey)) {
        return mapRegistry.get(namespacedKey);
      }
    }
    return this.globalRegistry.get(namespacedKey);
  }

  static override getKeysForMap(
    mapId: string,
    namespace: RegistryNamespaceKind,
  ): string[] {
    if (namespace === 'component') {
      const prefix = REGISTRY_NAMESPACES.COMPONENT;
      return Array.from(getMapRegistryStore(mapId).keys())
        .filter((key) => key.startsWith(prefix))
        .map((key) => key.slice(prefix.length));
    }
    return super.getKeysForMap(mapId, namespace);
  }
}

export function useUniversalRegistry(mapId?: string) {
  return {
    getComponent(key: string, defaultValue?: ComponentType<any>) {
      return UniversalRegistry.getComponent(key, mapId) || defaultValue;
    },
  };
}
