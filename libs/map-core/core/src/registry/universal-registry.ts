/**
 * Framework-agnostic UniversalRegistry.
 * Methods, menu handlers, components, and control handles share one resolve path.
 * Process-wide globals: `map:registry:global` (`@hungpvq/shared-store`).
 * Per-map namespaced method/menu/component bags + control handles / layout /
 * auto-button live on `map:core[mapId]` (domain stores).
 * Vue/React subclasses only add typed `registerComponent` / `getComponent`
 * (e.g. Vue `markRaw`); storage is owned here.
 */
import { loggerFactory } from '@hungpvq/shared-log';
import { getOrCreateStore } from '@hungpvq/shared-store';

import { logHelper } from '../utils/log';
import { type MapControlHandle, type MapControlPanelPosition } from './control';
import { clearControlAutoButtonsForMap } from './control-auto-button-store';
import {
  clearControlLayoutsForMap,
  getControlLayout,
  type MapControlLayoutPatch,
  type MapControlLayoutState,
  setControlLayout,
} from './control-layout-store';
import {
  clearMapControlsStore,
  ensureMapControlsStore,
  peekMapControlsStore,
} from './controls-store';
import {
  clearMapRegistryMapsStore,
  ensureMapRegistryMapsStore,
  peekMapRegistryMapsStore,
} from './registry-maps-store';

export type RegistryFn = (...args: any[]) => unknown;

export type RegistryNamespaceKind =
  'component' | 'method' | 'menu-handler' | 'control';

export const REGISTRY_NAMESPACES = {
  COMPONENT: 'component:',
  METHOD: 'method:',
  MENU_HANDLER: 'menu-handler:',
  CONTROL: 'control:',
} as const;

/** Shared key for the global registry bag (methods / menu / components). */
export const REGISTRY_GLOBAL_STORE_KEY = 'map:registry:global';

type RegistryBag = Record<string, unknown>;

const logger = loggerFactory.createLogger().setNamespace('map:registry', 2);

function warnOverwrite(mapId: string, key: string) {
  logHelper(logger, mapId, 'registry')
    .with({ fn: 'warnOverwrite', span: 'validation' })
    .warn(`Key '${key}' already exists for map ${mapId}, overwriting`);
}

function globalBag(): RegistryBag {
  return getOrCreateStore<RegistryBag>(REGISTRY_GLOBAL_STORE_KEY, () => ({}));
}

export class UniversalRegistry {
  private static resolveValue<T>(
    namespacedKey: string,
    mapId?: string,
  ): T | undefined {
    if (mapId) {
      const mapStore = peekMapRegistryMapsStore(mapId);
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
    const store = ensureMapRegistryMapsStore(mapId);
    if (namespacedKey in store) {
      warnOverwrite(mapId, namespacedKey);
    }
    store[namespacedKey] = value;
  }

  private static deleteMapValue(mapId: string, namespacedKey: string) {
    const store = peekMapRegistryMapsStore(mapId);
    if (store) {
      delete store[namespacedKey];
    }
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

  /** Remove a map-scoped menu handler. No-op if missing. Global handlers are unchanged. */
  static unregisterMenuHandlerForMap(mapId: string, key: string) {
    this.deleteMapValue(mapId, REGISTRY_NAMESPACES.MENU_HANDLER + key);
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
    const store = ensureMapControlsStore(mapId);
    if (key in store) {
      warnOverwrite(mapId, REGISTRY_NAMESPACES.CONTROL + key);
    }
    store[key] = handle;
  }

  static unregisterControl(mapId: string, key: string) {
    const store = peekMapControlsStore(mapId);
    if (store) {
      delete store[key];
    }
    // Layout SoT is cleared only on removeControlLayout / clearMap (not on
    // intentional handle refresh via unregister+register).
  }

  static getControl(key: string, mapId: string): MapControlHandle | undefined {
    return peekMapControlsStore(mapId)?.[key];
  }

  static listControls(mapId: string): MapControlHandle[] {
    const store = peekMapControlsStore(mapId);
    return store ? Object.values(store) : [];
  }

  static openControl(mapId: string, key: string) {
    this.getControl(key, mapId)?.open();
  }

  static closeControl(mapId: string, key: string) {
    this.getControl(key, mapId)?.close();
  }

  /**
   * Panel offsets / sidebar dock (not button corner).
   * For button corner / visibility / order / controlLayout use {@link setControlLayout}.
   */
  static setControlPosition(
    mapId: string,
    key: string,
    pos: MapControlPanelPosition,
  ) {
    this.getControl(key, mapId)?.setPanelPosition(pos);
  }

  /** Button layout SoT patch (visible, corner position, order, controlLayout, buttonInMobile). */
  static setControlLayout(
    mapId: string,
    key: string,
    patch: MapControlLayoutPatch,
  ): MapControlLayoutState {
    return setControlLayout(mapId, key, patch);
  }

  static getControlLayout(
    mapId: string,
    key: string,
  ): MapControlLayoutState | undefined {
    return (
      getControlLayout(mapId, key) ?? this.getControl(key, mapId)?.getLayout()
    );
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
      const store = peekMapControlsStore(mapId);
      return store ? Object.keys(store) : [];
    }
    const prefix =
      namespace === 'method'
        ? REGISTRY_NAMESPACES.METHOD
        : namespace === 'menu-handler'
          ? REGISTRY_NAMESPACES.MENU_HANDLER
          : REGISTRY_NAMESPACES.COMPONENT;
    const store = peekMapRegistryMapsStore(mapId);
    if (!store) return [];
    return Object.keys(store)
      .filter((key) => key.startsWith(prefix))
      .map((key) => key.slice(prefix.length));
  }

  /** Drop per-map methods, menu handlers, components, controls, and layouts (removeMap). */
  static clearMap(mapId: string) {
    clearMapRegistryMapsStore(mapId);
    clearMapControlsStore(mapId);
    clearControlLayoutsForMap(mapId);
    clearControlAutoButtonsForMap(mapId);
  }
}
