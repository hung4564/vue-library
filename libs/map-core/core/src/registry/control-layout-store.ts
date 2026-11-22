/**
 * Per-control button layout SoT (visible, corner position, order, controlLayout,
 * optional buttonInMobile override). Mount props seed defaults; runtime patches win.
 * Bag: `map:core[mapId][MAP_STORE_KEY.CONTROL_LAYOUT]`.
 */
import {
  getMapCoreMetaStore,
  type MapCoreMetaStore,
} from '../store/map-core-meta';
import {
  deleteMapDomainStore,
  ensureMapDomainStore,
  hasMapDomainStoreFactory,
  peekMapDomainStore,
  registerMapDomainStoreFactory,
} from '../store/map-domain-store';
import type { ButtonInMobile, ControlLayout, Position } from '../types';
import { MAP_STORE_KEY } from '../types/constants';

export type MapControlLayoutState = {
  visible: boolean;
  position: Position;
  order: number;
  controlLayout: ControlLayout;
  /** `undefined` = inherit Map.buttonInMobile */
  buttonInMobile?: ButtonInMobile;
};

export type MapControlLayoutPatch = Partial<MapControlLayoutState>;

export type MapControlLayoutStore = {
  byId: Record<string, MapControlLayoutState>;
};

type LayoutListener = (mapId: string, controlId: string) => void;

type MetaWithLayoutListeners = MapCoreMetaStore & {
  controlLayoutListeners?: Set<LayoutListener>;
};

function layoutListeners(): Set<LayoutListener> {
  const meta = getMapCoreMetaStore() as MetaWithLayoutListeners;
  if (!meta.controlLayoutListeners) {
    meta.controlLayoutListeners = new Set();
  }
  return meta.controlLayoutListeners;
}

function registerControlLayoutFactory() {
  registerMapDomainStoreFactory(MAP_STORE_KEY.CONTROL_LAYOUT, {
    create: (): MapControlLayoutStore => ({ byId: {} }),
  });
}

function ensureLayoutFactory() {
  if (!hasMapDomainStoreFactory(MAP_STORE_KEY.CONTROL_LAYOUT)) {
    registerControlLayoutFactory();
  }
}

function ensureLayoutStore(mapId: string): MapControlLayoutStore {
  ensureLayoutFactory();
  return ensureMapDomainStore<MapControlLayoutStore>(
    mapId,
    MAP_STORE_KEY.CONTROL_LAYOUT,
  );
}

function peekLayoutStore(mapId: string): MapControlLayoutStore | undefined {
  return peekMapDomainStore<MapControlLayoutStore>(
    mapId,
    MAP_STORE_KEY.CONTROL_LAYOUT,
  );
}

function notify(mapId: string, controlId: string) {
  layoutListeners().forEach((listener) => listener(mapId, controlId));
}

export const DEFAULT_CONTROL_LAYOUT_STATE: MapControlLayoutState = {
  visible: true,
  position: 'bottom-right',
  order: 0,
  controlLayout: 'standalone',
};

export function normalizeControlLayoutDefaults(
  partial?: MapControlLayoutPatch,
): MapControlLayoutState {
  return {
    ...DEFAULT_CONTROL_LAYOUT_STATE,
    ...partial,
    // Keep explicit undefined for inherit semantics when patch sets buttonInMobile: undefined
    buttonInMobile:
      partial && 'buttonInMobile' in partial
        ? partial.buttonInMobile
        : DEFAULT_CONTROL_LAYOUT_STATE.buttonInMobile,
  };
}

/** Seed layout on first register; does not overwrite an existing entry. */
export function ensureControlLayout(
  mapId: string,
  controlId: string,
  defaults?: MapControlLayoutPatch,
): MapControlLayoutState {
  const bag = ensureLayoutStore(mapId);
  if (!bag.byId[controlId]) {
    bag.byId[controlId] = normalizeControlLayoutDefaults(defaults);
    notify(mapId, controlId);
  }
  return bag.byId[controlId];
}

export function getControlLayout(
  mapId: string,
  controlId: string,
): MapControlLayoutState | undefined {
  return peekLayoutStore(mapId)?.byId[controlId];
}

export function setControlLayout(
  mapId: string,
  controlId: string,
  patch: MapControlLayoutPatch,
): MapControlLayoutState {
  const bag = ensureLayoutStore(mapId);
  const prev = bag.byId[controlId] ?? normalizeControlLayoutDefaults();
  const next: MapControlLayoutState = {
    ...prev,
    ...patch,
  };
  if ('buttonInMobile' in patch) {
    next.buttonInMobile = patch.buttonInMobile;
  }
  bag.byId[controlId] = next;
  notify(mapId, controlId);
  return next;
}

export function removeControlLayout(mapId: string, controlId: string): void {
  const bag = peekLayoutStore(mapId);
  if (!bag || !(controlId in bag.byId)) return;
  delete bag.byId[controlId];
  notify(mapId, controlId);
}

export function clearControlLayoutsForMap(mapId: string): void {
  if (!peekLayoutStore(mapId)) return;
  deleteMapDomainStore(mapId, MAP_STORE_KEY.CONTROL_LAYOUT);
  layoutListeners().forEach((listener) => listener(mapId, '*'));
}

export function subscribeControlLayout(listener: LayoutListener): () => void {
  const listeners = layoutListeners();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Effective mobile promotion mode: per-control override or Map default. */
export function resolveEffectiveButtonInMobile(
  controlOverride: ButtonInMobile | undefined,
  mapButtonInMobile: ButtonInMobile | undefined,
): ButtonInMobile | undefined {
  return controlOverride ?? mapButtonInMobile;
}
