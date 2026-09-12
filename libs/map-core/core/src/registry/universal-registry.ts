/**
 * Framework-agnostic UniversalRegistry.
 * One store and one resolve path for methods, menu handlers, and control handles.
 * Vue/React subclasses add `registerComponent` / `getComponent`.
 */
import { loggerFactory } from '@hungpvq/shared-log';
import { logHelper } from '../utils/log';
import {
  type MapControlHandle,
  type MapControlPanelPosition,
} from './control';

export type RegistryFn = (...args: unknown[]) => unknown;

export type RegistryNamespaceKind =
  | 'component'
  | 'method'
  | 'menu-handler'
  | 'control';

export const REGISTRY_NAMESPACES = {
  COMPONENT: 'component:',
  METHOD: 'method:',
  MENU_HANDLER: 'menu-handler:',
  CONTROL: 'control:',
} as const;

/** Shared key for the framework adapter's global component store. */
export const REGISTRY_GLOBAL_STORE_KEY = 'map:registry:global';

const logger = loggerFactory.createLogger().setNamespace('map:registry', 2);

function warnOverwrite(mapId: string, key: string) {
  logHelper(logger, mapId, 'registry').warn(
    `Key '${key}' already exists for map ${mapId}, overwriting`,
  );
}

export class UniversalRegistry {
  private static global = new Map<string, RegistryFn>();
  private static maps = new Map<string, Map<string, RegistryFn>>();
  private static controls = new Map<string, Map<string, MapControlHandle>>();

  private static ensureMapStore(mapId: string): Map<string, RegistryFn> {
    let store = this.maps.get(mapId);
    if (!store) {
      store = new Map();
      this.maps.set(mapId, store);
    }
    return store;
  }

  private static ensureControlStore(
    mapId: string,
  ): Map<string, MapControlHandle> {
    let store = this.controls.get(mapId);
    if (!store) {
      store = new Map();
      this.controls.set(mapId, store);
    }
    return store;
  }

  private static resolveFn<T extends RegistryFn>(
    namespacedKey: string,
    mapId?: string,
  ): T | undefined {
    if (mapId) {
      const mapStore = this.maps.get(mapId);
      if (mapStore?.has(namespacedKey)) {
        return mapStore.get(namespacedKey) as T;
      }
    }
    return this.global.get(namespacedKey) as T | undefined;
  }

  private static setMapFn(
    mapId: string,
    namespacedKey: string,
    fn: RegistryFn,
  ) {
    const store = this.ensureMapStore(mapId);
    if (store.has(namespacedKey)) {
      warnOverwrite(mapId, namespacedKey);
    }
    store.set(namespacedKey, fn);
  }

  static registerMethod(key: string, fn: RegistryFn) {
    this.global.set(REGISTRY_NAMESPACES.METHOD + key, fn);
  }

  static registerMethodForMap(mapId: string, key: string, fn: RegistryFn) {
    this.setMapFn(mapId, REGISTRY_NAMESPACES.METHOD + key, fn);
  }

  static registerMenuHandler(key: string, fn: RegistryFn) {
    this.global.set(REGISTRY_NAMESPACES.MENU_HANDLER + key, fn);
  }

  static registerMenuHandlerForMap(mapId: string, key: string, fn: RegistryFn) {
    this.setMapFn(mapId, REGISTRY_NAMESPACES.MENU_HANDLER + key, fn);
  }

  static getMethod<T extends RegistryFn = RegistryFn>(
    key: string,
    mapId?: string,
  ): T | undefined {
    return this.resolveFn<T>(REGISTRY_NAMESPACES.METHOD + key, mapId);
  }

  static getMenuHandler<T extends RegistryFn = RegistryFn>(
    key: string,
    mapId?: string,
  ): T | undefined {
    return this.resolveFn<T>(REGISTRY_NAMESPACES.MENU_HANDLER + key, mapId);
  }

  static hasMenuHandler(key: string, mapId?: string): boolean {
    return this.getMenuHandler(key, mapId) != null;
  }

  static registerControl(mapId: string, key: string, handle: MapControlHandle) {
    const store = this.ensureControlStore(mapId);
    if (store.has(key)) {
      warnOverwrite(mapId, REGISTRY_NAMESPACES.CONTROL + key);
    }
    store.set(key, handle);
  }

  static unregisterControl(mapId: string, key: string) {
    this.controls.get(mapId)?.delete(key);
  }

  static getControl(key: string, mapId: string): MapControlHandle | undefined {
    return this.controls.get(mapId)?.get(key);
  }

  static listControls(mapId: string): MapControlHandle[] {
    return Array.from(this.controls.get(mapId)?.values() ?? []);
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

  static getKeysForMap(
    mapId: string,
    namespace: RegistryNamespaceKind,
  ): string[] {
    if (namespace === 'component') return [];
    if (namespace === 'control') {
      return Array.from(this.controls.get(mapId)?.keys() ?? []);
    }
    const prefix =
      namespace === 'method'
        ? REGISTRY_NAMESPACES.METHOD
        : REGISTRY_NAMESPACES.MENU_HANDLER;
    const store = this.maps.get(mapId);
    if (!store) return [];
    return Array.from(store.keys())
      .filter((key) => key.startsWith(prefix))
      .map((key) => key.slice(prefix.length));
  }

  /** Drop per-map methods, menu handlers, and controls (called from removeMap). */
  static clearMap(mapId: string) {
    this.maps.delete(mapId);
    this.controls.delete(mapId);
  }
}
