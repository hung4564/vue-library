/* Dynamic registry: components/methods are registered at runtime with heterogeneous signatures. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  logHelper,
  MAP_STORE_KEY,
  methodRegistry,
  REGISTRY_CONTROL_PREFIX,
  type MapControlHandle,
  type MapControlPanelPosition,
} from '@hungpvq/map-core';
import { createStore } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import { GlobalStoreService } from '@hungpvq/shared-store';
import type { ComponentType } from 'react';
import { createMapScopedStore } from '../../store';

const logger = loggerFactory.createLogger().setNamespace('map:registry', 2);
const KEY = MAP_STORE_KEY.REGISTRY;
const GLOBAL_REGISTRY_KEY = 'map:registry:global';

export type RegistryItem =
  | ((...args: any[]) => any)
  | ComponentType<any>
  | MapControlHandle;

export function getMapRegistryStore(mapId: string) {
  return createMapScopedStore<Map<string, RegistryItem>>(mapId, KEY, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return new Map<string, RegistryItem>();
  });
}

export const useMapRegistryStore = getMapRegistryStore;

export class UniversalRegistry {
  private static globalRegistry = createStore<Map<string, RegistryItem>>(
    GLOBAL_REGISTRY_KEY,
    new Map<string, RegistryItem>(),
  );
  private static readonly NAMESPACES = {
    COMPONENT: 'component:',
    METHOD: 'method:',
    MENU_HANDLER: 'menu-handler:',
    CONTROL: REGISTRY_CONTROL_PREFIX,
  } as const;

  private static notifyGlobal() {
    GlobalStoreService.getInstance().set(
      GLOBAL_REGISTRY_KEY,
      this.globalRegistry,
    );
  }

  static registerComponent(key: string, comp: ComponentType<any>) {
    this.globalRegistry.set(this.NAMESPACES.COMPONENT + key, comp);
    this.notifyGlobal();
  }
  static registerMethod(key: string, fn: (...args: any[]) => any) {
    this.globalRegistry.set(this.NAMESPACES.METHOD + key, fn);
    methodRegistry.registerMethod(key, fn);
    this.notifyGlobal();
  }
  static registerMenuHandler(key: string, fn: (...args: any[]) => any) {
    this.globalRegistry.set(this.NAMESPACES.MENU_HANDLER + key, fn);
    methodRegistry.registerMenuHandler(key, fn);
    this.notifyGlobal();
  }
  static registerMenuHandlerForMap(
    mapId: string,
    key: string,
    fn: (...args: any[]) => any,
  ) {
    const namespacedKey = this.NAMESPACES.MENU_HANDLER + key;
    const mapRegistry = getMapRegistryStore(mapId);
    mapRegistry.set(namespacedKey, fn);
    methodRegistry.registerMenuHandlerForMap(mapId, key, fn);
  }

  static registerControl(mapId: string, key: string, handle: MapControlHandle) {
    this.registerControlForMap(mapId, key, handle);
  }

  static registerControlForMap(
    mapId: string,
    key: string,
    handle: MapControlHandle,
  ) {
    const namespacedKey = this.NAMESPACES.CONTROL + key;
    const mapRegistry = getMapRegistryStore(mapId);
    mapRegistry.set(namespacedKey, handle);
  }

  static unregisterControl(mapId: string, key: string) {
    const namespacedKey = this.NAMESPACES.CONTROL + key;
    getMapRegistryStore(mapId).delete(namespacedKey);
  }

  static getControl(key: string, mapId: string): MapControlHandle | undefined {
    return getMapRegistryStore(mapId).get(
      this.NAMESPACES.CONTROL + key,
    ) as MapControlHandle | undefined;
  }

  static listControls(mapId: string): MapControlHandle[] {
    const mapRegistry = getMapRegistryStore(mapId);
    const prefix = this.NAMESPACES.CONTROL;
    return Array.from(mapRegistry.entries())
      .filter(([k]) => k.startsWith(prefix))
      .map(([, v]) => v as MapControlHandle);
  }

  static openControl(mapId: string, key: string) {
    this.getControl(key, mapId)?.open();
  }

  static closeControl(mapId: string, key: string) {
    this.getControl(key, mapId)?.close();
  }

  static setControlPosition(
    mapId: string,
    key: string,
    pos: MapControlPanelPosition,
  ) {
    this.getControl(key, mapId)?.setPanelPosition(pos);
  }

  static runControlAction(
    mapId: string,
    key: string,
    type?: string,
    event?: unknown,
  ) {
    this.getControl(key, mapId)?.runAction(type, event);
  }

  static getComponent(key: string, mapId?: string): ComponentType<any> | undefined {
    const namespacedKey = this.NAMESPACES.COMPONENT + key;
    if (mapId) {
      const mapRegistry = getMapRegistryStore(mapId);
      if (mapRegistry.has(namespacedKey)) {
        return mapRegistry.get(namespacedKey) as ComponentType<any>;
      }
    }
    return this.globalRegistry.get(namespacedKey) as ComponentType<any> | undefined;
  }
  static getMethod<T extends (...args: any[]) => any = (...args: any[]) => any>(
    key: string,
    mapId?: string,
  ): T | undefined {
    return (
      methodRegistry.getMethod<T>(key, mapId) ??
      (this.globalRegistry.get(this.NAMESPACES.METHOD + key) as T | undefined)
    );
  }
  static getMenuHandler<T extends (...args: any[]) => any = (...args: any[]) => any>(
    key: string,
    mapId?: string,
  ): T | undefined {
    return (
      methodRegistry.getMenuHandler<T>(key, mapId) ??
      (this.globalRegistry.get(
        this.NAMESPACES.MENU_HANDLER + key,
      ) as T | undefined)
    );
  }

  static getKeysForMap(
    mapId: string,
    namespace: 'component' | 'method' | 'menu-handler' | 'control',
  ): string[] {
    const mapRegistry = getMapRegistryStore(mapId);
    const resolved =
      namespace === 'component'
        ? this.NAMESPACES.COMPONENT
        : namespace === 'method'
          ? this.NAMESPACES.METHOD
          : namespace === 'menu-handler'
            ? this.NAMESPACES.MENU_HANDLER
            : this.NAMESPACES.CONTROL;
    return Array.from(mapRegistry.keys())
      .filter((key) => key.startsWith(resolved))
      .map((key) => key.replace(resolved, ''));
  }
}

export function useUniversalRegistry(mapId?: string) {
  return {
    getComponent(key: string, defaultValue?: ComponentType<any>) {
      return UniversalRegistry.getComponent(key, mapId) || defaultValue;
    },
    getMethod: UniversalRegistry.getMethod.bind(UniversalRegistry),
    getMenuHandler: UniversalRegistry.getMenuHandler.bind(UniversalRegistry),
    getControl(key: string, defaultValue?: MapControlHandle) {
      if (!mapId) return defaultValue;
      return UniversalRegistry.getControl(key, mapId) || defaultValue;
    },
    listControls(): MapControlHandle[] {
      if (!mapId) return [];
      return UniversalRegistry.listControls(mapId);
    },
    getKeysForMap(
      namespace: 'component' | 'method' | 'menu-handler' | 'control',
    ): string[] {
      if (!mapId) return [];
      return UniversalRegistry.getKeysForMap(mapId, namespace);
    },
  };
}
