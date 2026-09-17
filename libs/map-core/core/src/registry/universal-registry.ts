/**
 * Framework-agnostic UniversalRegistry.
 * Methods, menu handlers, components, and control handles share one resolve path.
 * Backing bags live in `@hungpvq/shared-store` (globalThis) so duplicate package
 * copies still share memory — no class-static `new Map` singletons.
 * Vue/React subclasses only add typed `registerComponent` / `getComponent`
 * (e.g. Vue `markRaw`); storage is owned here.
 */
import { getOrCreateStore } from '@hungpvq/shared-store';
import { loggerFactory } from '@hungpvq/shared-log';
import { logHelper } from '../utils/log';
import {
  type MapControlHandle,
  type MapControlPanelPosition,
} from './control';

export type RegistryFn = (...args: any[]) => unknown;

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

/** Shared key for the global registry bag (methods / menu / components). */
export const REGISTRY_GLOBAL_STORE_KEY = 'map:registry:global';

/** Per-map namespaced fn/component bags. */
export const REGISTRY_MAPS_STORE_KEY = 'map:registry:maps';

/** Per-map control handles. */
export const REGISTRY_CONTROLS_STORE_KEY = 'map:registry:controls';

type RegistryBag = Record<string, unknown>;
type RegistryMapsBag = Record<string, RegistryBag>;
type ControlBag = Record<string, MapControlHandle>;
type ControlsMapsBag = Record<string, ControlBag>;

const logger = loggerFactory.createLogger().setNamespace('map:registry', 2);

function warnOverwrite(mapId: string, key: string) {
  logHelper(logger, mapId, 'registry').warn(
    `Key '${key}' already exists for map ${mapId}, overwriting`,
  );
}

function globalBag(): RegistryBag {
  return getOrCreateStore<RegistryBag>(REGISTRY_GLOBAL_STORE_KEY, () => ({}));
}

function mapsBag(): RegistryMapsBag {
  return getOrCreateStore<RegistryMapsBag>(REGISTRY_MAPS_STORE_KEY, () => ({}));
}

function controlsBag(): ControlsMapsBag {
  return getOrCreateStore<ControlsMapsBag>(
    REGISTRY_CONTROLS_STORE_KEY,
    () => ({}),
  );
}

function ensureMapBag(mapId: string): RegistryBag {
  const maps = mapsBag();
  if (!maps[mapId]) {
    maps[mapId] = {};
  }
  return maps[mapId];
}

function ensureControlBag(mapId: string): ControlBag {
  const controls = controlsBag();
  if (!controls[mapId]) {
    controls[mapId] = {};
  }
  return controls[mapId];
}

export class UniversalRegistry {
  private static resolveValue<T>(
    namespacedKey: string,
    mapId?: string,
  ): T | undefined {
    if (mapId) {
      const mapStore = mapsBag()[mapId];
      if (mapStore && namespacedKey in mapStore) {
        return mapStore[namespacedKey] as T;
      }
    }
    return globalBag()[namespacedKey] as T | undefined;
  }

  private static setMapValue(
    mapId: string,
    namespacedKey: string,
    value: unknown,
  ) {
    const store = ensureMapBag(mapId);
    if (namespacedKey in store) {
      warnOverwrite(mapId, namespacedKey);
    }
    store[namespacedKey] = value;
  }

  static registerMethod(key: string, fn: RegistryFn) {
    globalBag()[REGISTRY_NAMESPACES.METHOD + key] = fn;
  }

  static registerMethodForMap(mapId: string, key: string, fn: RegistryFn) {
    this.setMapValue(mapId, REGISTRY_NAMESPACES.METHOD + key, fn);
  }

  static registerMenuHandler(key: string, fn: RegistryFn) {
    globalBag()[REGISTRY_NAMESPACES.MENU_HANDLER + key] = fn;
  }

  static registerMenuHandlerForMap(mapId: string, key: string, fn: RegistryFn) {
    this.setMapValue(mapId, REGISTRY_NAMESPACES.MENU_HANDLER + key, fn);
  }

  /**
   * Register a UI component (framework-agnostic value).
   * Adapters typically wrap with typed Component + Vue `markRaw`.
   */
  static registerComponent(key: string, component: unknown) {
    globalBag()[REGISTRY_NAMESPACES.COMPONENT + key] = component;
  }

  static registerComponentForMap(
    mapId: string,
    key: string,
    component: unknown,
  ) {
    this.setMapValue(mapId, REGISTRY_NAMESPACES.COMPONENT + key, component);
  }

  /** Framework-agnostic component value; adapters narrow the return type. */
  static getComponent(key: string, mapId?: string): unknown {
    return this.resolveValue(REGISTRY_NAMESPACES.COMPONENT + key, mapId);
  }

  static getMethod<T extends RegistryFn = RegistryFn>(
    key: string,
    mapId?: string,
  ): T | undefined {
    return this.resolveValue<T>(REGISTRY_NAMESPACES.METHOD + key, mapId);
  }

  static getMenuHandler<T extends RegistryFn = RegistryFn>(
    key: string,
    mapId?: string,
  ): T | undefined {
    return this.resolveValue<T>(REGISTRY_NAMESPACES.MENU_HANDLER + key, mapId);
  }

  static hasMenuHandler(key: string, mapId?: string): boolean {
    return this.getMenuHandler(key, mapId) != null;
  }

  static registerControl(mapId: string, key: string, handle: MapControlHandle) {
    const store = ensureControlBag(mapId);
    if (key in store) {
      warnOverwrite(mapId, REGISTRY_NAMESPACES.CONTROL + key);
    }
    store[key] = handle;
  }

  static unregisterControl(mapId: string, key: string) {
    const store = controlsBag()[mapId];
    if (store) {
      delete store[key];
    }
  }

  static getControl(key: string, mapId: string): MapControlHandle | undefined {
    return controlsBag()[mapId]?.[key];
  }

  static listControls(mapId: string): MapControlHandle[] {
    const store = controlsBag()[mapId];
    return store ? Object.values(store) : [];
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
    if (namespace === 'control') {
      const store = controlsBag()[mapId];
      return store ? Object.keys(store) : [];
    }
    const prefix =
      namespace === 'method'
        ? REGISTRY_NAMESPACES.METHOD
        : namespace === 'menu-handler'
          ? REGISTRY_NAMESPACES.MENU_HANDLER
          : REGISTRY_NAMESPACES.COMPONENT;
    const store = mapsBag()[mapId];
    if (!store) return [];
    return Object.keys(store)
      .filter((key) => key.startsWith(prefix))
      .map((key) => key.slice(prefix.length));
  }

  /** Drop per-map methods, menu handlers, components, and controls (removeMap). */
  static clearMap(mapId: string) {
    delete mapsBag()[mapId];
    delete controlsBag()[mapId];
  }
}
