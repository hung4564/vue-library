import {
  logHelper,
  MAP_STORE_KEY,
  methodRegistry,
  REGISTRY_CONTROL_PREFIX,
  type MapControlHandle,
  type MapControlPanelPosition,
} from '@hungpvq/map-core';
import { createStore } from '@hungpvq/shared';
import type { Component } from 'vue';
import { logger } from '../../logger';
import { createMapScopedStore } from '../../store';

const KEY = MAP_STORE_KEY.REGISTRY;
export const useMapRegistryStore = (mapId: string) =>
  createMapScopedStore<Map<string, RegistryItem>>(mapId, KEY as any, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return new Map<string, RegistryItem>();
  });

export type RegistryItem =
  | ((...args: any[]) => any)
  | Component
  | MapControlHandle;

export class UniversalRegistry {
  // Global registry cho tất cả map
  private static globalRegistry = createStore<Map<string, RegistryItem>>(
    'map:registry:global',
    new Map<string, RegistryItem>(),
  );

  // Namespace prefixes
  private static readonly NAMESPACES = {
    COMPONENT: 'component:',
    METHOD: 'method:',
    MENU_HANDLER: 'menu-handler:',
    CONTROL: REGISTRY_CONTROL_PREFIX,
  } as const;

  // ===== GLOBAL REGISTRATION =====

  /** Đăng ký component toàn cục */
  static registerComponent(key: string, comp: Component) {
    const namespacedKey = this.NAMESPACES.COMPONENT + key;
    this.globalRegistry.set(namespacedKey, comp);
  }

  /** Đăng ký method toàn cục */
  static registerMethod(key: string, fn: (...args: any[]) => any) {
    const namespacedKey = this.NAMESPACES.METHOD + key;
    this.globalRegistry.set(namespacedKey, fn);
    methodRegistry.registerMethod(key, fn);
  }

  /** Đăng ký menu handler toàn cục */
  static registerMenuHandler(key: string, fn: (...args: any[]) => any) {
    const namespacedKey = this.NAMESPACES.MENU_HANDLER + key;
    this.globalRegistry.set(namespacedKey, fn);
    methodRegistry.registerMenuHandler(key, fn);
  }

  // ===== MAP-SPECIFIC REGISTRATION =====

  /** Đăng ký component cho map cụ thể */
  static registerComponentForMap(mapId: string, key: string, comp: Component) {
    const namespacedKey = this.NAMESPACES.COMPONENT + key;
    this.registerForMap(mapId, namespacedKey, comp);
  }

  /** Đăng ký method cho map cụ thể */
  static registerMethodForMap(
    mapId: string,
    key: string,
    fn: (...args: any[]) => any,
  ) {
    const namespacedKey = this.NAMESPACES.METHOD + key;
    this.registerForMap(mapId, namespacedKey, fn);
  }

  /** Đăng ký menu handler cho map cụ thể */
  static registerMenuHandlerForMap(
    mapId: string,
    key: string,
    fn: (...args: any[]) => any,
  ) {
    const namespacedKey = this.NAMESPACES.MENU_HANDLER + key;
    this.registerForMap(mapId, namespacedKey, fn);
    methodRegistry.registerMenuHandlerForMap(mapId, key, fn);
  }

  /** Đăng ký map control handle (panel + button actions) */
  static registerControl(mapId: string, key: string, handle: MapControlHandle) {
    this.registerControlForMap(mapId, key, handle);
  }

  static registerControlForMap(
    mapId: string,
    key: string,
    handle: MapControlHandle,
  ) {
    const namespacedKey = this.NAMESPACES.CONTROL + key;
    this.registerForMap(mapId, namespacedKey, handle);
  }

  static unregisterControl(mapId: string, key: string) {
    const namespacedKey = this.NAMESPACES.CONTROL + key;
    const mapRegistry = useMapRegistryStore(mapId);
    mapRegistry.delete(namespacedKey);
  }

  static getControl(key: string, mapId: string): MapControlHandle | undefined {
    const namespacedKey = this.NAMESPACES.CONTROL + key;
    const mapRegistry = useMapRegistryStore(mapId);
    return mapRegistry.get(namespacedKey) as MapControlHandle | undefined;
  }

  static listControls(mapId: string): MapControlHandle[] {
    const mapRegistry = useMapRegistryStore(mapId);
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

  static runControlAction(mapId: string, key: string, type?: string, event?: unknown) {
    this.getControl(key, mapId)?.runAction(type, event);
  }

  // ===== INTERNAL HELPER =====

  private static registerForMap(
    mapId: string,
    key: string,
    item: RegistryItem,
  ) {
    const mapRegistry = useMapRegistryStore(mapId);

    if (mapRegistry.has(key)) {
      logHelper(logger, mapId, 'registry').warn(
        `Key '${key}' đã tồn tại cho map ${mapId}, sẽ ghi đè`,
      );
    }
    mapRegistry.set(key, item);
  }

  // ===== RETRIEVAL WITH PRIORITY =====

  /** Lấy component: map-specific trước, rồi global */
  static getComponent(key: string, mapId?: string): Component | undefined {
    const namespacedKey = this.NAMESPACES.COMPONENT + key;

    // 1. Tìm trong map-specific trước (nếu có mapId)
    if (mapId) {
      const mapRegistry = useMapRegistryStore(mapId);
      if (mapRegistry.has(namespacedKey)) {
        return mapRegistry.get(namespacedKey) as Component;
      }
    }

    // 2. Fallback to global
    return this.globalRegistry.get(namespacedKey) as Component | undefined;
  }

  /** Lấy method: map-specific trước, rồi global */
  static getMethod<T extends (...args: any[]) => any = (...args: any[]) => any>(
    key: string,
    mapId?: string,
  ): T | undefined {
    const namespacedKey = this.NAMESPACES.METHOD + key;

    // 1. Tìm trong map-specific trước
    if (mapId) {
      const mapRegistry = useMapRegistryStore(mapId);
      if (mapRegistry.has(namespacedKey)) {
        return mapRegistry.get(namespacedKey) as T;
      }
    }

    // 2. Fallback to global
    return this.globalRegistry.get(namespacedKey) as T | undefined;
  }

  /** Lấy menu handler: map-specific trước, rồi global */
  static getMenuHandler<
    T extends (...args: any[]) => any = (...args: any[]) => any,
  >(key: string, mapId?: string): T | undefined {
    const namespacedKey = this.NAMESPACES.MENU_HANDLER + key;

    // 1. Tìm trong map-specific trước
    if (mapId) {
      const mapRegistry = useMapRegistryStore(mapId);
      if (mapRegistry.has(namespacedKey)) {
        return mapRegistry.get(namespacedKey) as T;
      }
    }

    // 2. Fallback to global
    return this.globalRegistry.get(namespacedKey) as T | undefined;
  }

  // ===== BACKWARD COMPATIBILITY =====

  /** Lấy item theo key (backward compatibility) */
  static get<T extends RegistryItem = RegistryItem>(
    key: string,
  ): T | undefined {
    // Tìm trong tất cả map registries trước
    // Note: Cần traverse tất cả map instances đang active
    // Có thể cần thêm global map instance tracking
    return this.globalRegistry.get(key) as T | undefined;
  }

  /** Kiểm tra có menu handler không */
  static hasMenuHandler(key: string, mapId?: string): boolean {
    const namespacedKey = this.NAMESPACES.MENU_HANDLER + key;

    if (mapId) {
      const mapRegistry = useMapRegistryStore(mapId);
      if (mapRegistry.has(namespacedKey)) return true;
    }

    return this.globalRegistry.has(namespacedKey);
  }

  // ===== UTILITY METHODS =====

  /** Lấy tất cả keys trong namespace cho map cụ thể */
  static getKeysForMap(
    mapId: string,
    namespace: 'component' | 'method' | 'menu-handler' | 'control',
  ): string[] {
    const mapRegistry = useMapRegistryStore(mapId);
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
  function get<T = any>(
    type: 'component' | 'method' | 'menu-handler' | 'control',
    name: string,
    defaultValue?: T,
  ): T | undefined {
    if (type === 'control') {
      if (!mapId) return defaultValue;
      return (UniversalRegistry.getControl(name, mapId) as T) || defaultValue;
    }
    const registry = UniversalRegistry as any;
    const getter = `get${type.charAt(0).toUpperCase() + type.slice(1)}`;

    if (registry[getter]) {
      return registry[getter](name, mapId) || defaultValue;
    }

    return defaultValue;
  }

  return {
    get,
    // Lấy component với priority: map-specific > global
    getComponent(key: string, defaultValue?: Component): Component | undefined {
      return UniversalRegistry.getComponent(key, mapId) || defaultValue;
    },
    // Lấy method với priority: map-specific > global
    getMethod<T extends (...args: any[]) => any = (...args: any[]) => any>(
      key: string,
      defaultValue?: T,
    ): T | undefined {
      return UniversalRegistry.getMethod<T>(key, mapId) || defaultValue;
    },
    // Lấy menu handler với priority: map-specific > global
    getMenuHandler<T extends (...args: any[]) => any = (...args: any[]) => any>(
      key: string,
      defaultValue?: T,
    ): T | undefined {
      return UniversalRegistry.getMenuHandler<T>(key, mapId) || defaultValue;
    },
    getControl(key: string, defaultValue?: MapControlHandle): MapControlHandle | undefined {
      if (!mapId) return defaultValue;
      return UniversalRegistry.getControl(key, mapId) || defaultValue;
    },
    listControls(): MapControlHandle[] {
      if (!mapId) return [];
      return UniversalRegistry.listControls(mapId);
    },
    // Utility methods
    getKeysForMap(
      namespace: 'component' | 'method' | 'menu-handler' | 'control',
    ): string[] {
      if (!mapId) return [];
      return UniversalRegistry.getKeysForMap(mapId, namespace);
    },
  };
}
