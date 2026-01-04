import { createStore } from '@hungpvq/shared';
import { logHelper } from '@hungpvq/shared-map';
import type { Component } from 'vue';
import { logger } from '../../logger';
import { createMapScopedStore } from '../../store';

const KEY = 'registry';
export const useMapRegistryStore = (mapId: string) =>
  createMapScopedStore<Map<string, RegistryItem>>(mapId, KEY, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return new Map<string, RegistryItem>();
  });

export type RegistryItem = ((...args: any[]) => any) | Component;

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
  }

  /** Đăng ký menu handler toàn cục */
  static registerMenuHandler(key: string, fn: (...args: any[]) => any) {
    const namespacedKey = this.NAMESPACES.MENU_HANDLER + key;
    this.globalRegistry.set(namespacedKey, fn);
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
  }

  // ===== INTERNAL HELPER =====

  private static registerForMap(
    mapId: string,
    key: string,
    item: RegistryItem,
  ) {
    const mapRegistry = useMapRegistryStore(mapId);

    if (mapRegistry.has(key)) {
      console.warn(
        `[UniversalRegistry] Key '${key}' đã tồn tại cho map ${mapId}, sẽ ghi đè`,
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
    namespace: 'component' | 'method' | 'menu-handler',
  ): string[] {
    const mapRegistry = useMapRegistryStore(mapId);
    const prefix =
      this.NAMESPACES[namespace.toUpperCase() as keyof typeof this.NAMESPACES];

    return Array.from(mapRegistry.keys())
      .filter((key) => key.startsWith(prefix))
      .map((key) => key.replace(prefix, ''));
  }
}

export function useUniversalRegistry(mapId?: string) {
  function get<T = any>(
    type: 'component' | 'method' | 'menu-handler',
    name: string,
    defaultValue?: T,
  ): T | undefined {
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
    // Utility methods
    getKeysForMap(
      namespace: 'component' | 'method' | 'menu-handler',
    ): string[] {
      if (!mapId) return [];
      return UniversalRegistry.getKeysForMap(mapId, namespace);
    },
  };
}
