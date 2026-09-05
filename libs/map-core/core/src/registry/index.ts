/**
 * Framework-agnostic method/menu-handler registry.
 * Component registration stays in the framework layer (Vue/React).
 * Map control handles are registered via UniversalRegistry (Vue/React).
 */

export type RegistryFn = (...args: any[]) => any;

export const REGISTRY_NAMESPACES = {
  COMPONENT: 'component:',
  METHOD: 'method:',
  MENU_HANDLER: 'menu-handler:',
  CONTROL: 'control:',
} as const;

export * from './control';
export * from './module-control-id';

export class MethodRegistry {
  private global = new Map<string, RegistryFn>();
  private maps = new Map<string, Map<string, RegistryFn>>();

  private ensureMapStore(mapId: string): Map<string, RegistryFn> {
    let store = this.maps.get(mapId);
    if (!store) {
      store = new Map();
      this.maps.set(mapId, store);
    }
    return store;
  }

  registerMethod(key: string, fn: RegistryFn) {
    this.global.set(REGISTRY_NAMESPACES.METHOD + key, fn);
  }

  registerMenuHandler(key: string, fn: RegistryFn) {
    this.global.set(REGISTRY_NAMESPACES.MENU_HANDLER + key, fn);
  }

  registerMenuHandlerForMap(mapId: string, key: string, fn: RegistryFn) {
    this.ensureMapStore(mapId).set(REGISTRY_NAMESPACES.MENU_HANDLER + key, fn);
  }

  getMethod<T extends RegistryFn = RegistryFn>(
    key: string,
    mapIdOrStore?: string | Map<string, RegistryFn>,
  ): T | undefined {
    const namespacedKey = REGISTRY_NAMESPACES.METHOD + key;
    const mapStore =
      typeof mapIdOrStore === 'string'
        ? this.maps.get(mapIdOrStore)
        : mapIdOrStore;
    if (mapStore?.has(namespacedKey)) {
      return mapStore.get(namespacedKey) as T;
    }
    return this.global.get(namespacedKey) as T | undefined;
  }

  getMenuHandler<T extends RegistryFn = RegistryFn>(
    key: string,
    mapIdOrStore?: string | Map<string, RegistryFn>,
  ): T | undefined {
    const namespacedKey = REGISTRY_NAMESPACES.MENU_HANDLER + key;
    const mapStore =
      typeof mapIdOrStore === 'string'
        ? this.maps.get(mapIdOrStore)
        : mapIdOrStore;
    if (mapStore?.has(namespacedKey)) {
      return mapStore.get(namespacedKey) as T;
    }
    return this.global.get(namespacedKey) as T | undefined;
  }

  hasMenuHandler(
    key: string,
    mapIdOrStore?: string | Map<string, RegistryFn>,
  ): boolean {
    const namespacedKey = REGISTRY_NAMESPACES.MENU_HANDLER + key;
    const mapStore =
      typeof mapIdOrStore === 'string'
        ? this.maps.get(mapIdOrStore)
        : mapIdOrStore;
    if (mapStore?.has(namespacedKey)) return true;
    return this.global.has(namespacedKey);
  }

  getGlobal(): Map<string, RegistryFn> {
    return this.global;
  }

  getMapStore(mapId: string): Map<string, RegistryFn> | undefined {
    return this.maps.get(mapId);
  }
}

export const methodRegistry = new MethodRegistry();
