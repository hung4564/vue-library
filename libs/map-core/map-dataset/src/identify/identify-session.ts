/**
 * Framework-agnostic IdentifyControl session: model state + runIdentifyMulti
 * pipeline + map-click/bbox mode orchestration. Hosts wire EventClick /
 * EventBbox / registry / UI / highlight store.
 */

import { bindMapLongPress, type MapSimple } from '@hungpvq/map-core';
import type { MapMouseEvent, PointLike } from 'maplibre-gl';
import type { IIdentifyView } from '../interfaces/dataset.parts';
import {
  createIdentifyControlModel,
  shouldBindIdentifyLongPress,
  type IdentifyControlModel,
  type IdentifyControlModelState,
  type IdentifyScopedSessionResult,
  type IdentifySessionToggleResult,
} from './control-model';
import {
  resolveIdentifyLayerFilterId,
  runIdentifyMulti,
  buildIdentifyResultPanelBase,
  type RunIdentifyResult,
} from './run-identify';
import {
  IDENTIFY_ALL_LAYERS_VALUE,
  type IdentifyResultUpdatePayload,
} from './result';
import {
  clearIdentifyScope,
  type IdentifyLayerFilterPayload,
  type IdentifyScopeToggleResult,
} from './scope';

export type IdentifyQueryInput =
  | { kind: 'point'; point: PointLike; event?: MapMouseEvent }
  | { kind: 'box'; box: [PointLike, PointLike] };

export type IdentifyBboxCorners = [
  { x: number; y: number },
  { x: number; y: number },
] | null | undefined;

export type IdentifySessionOptions = {
  getIdentifies: () => IIdentifyView[];
  mapId: string;
  preferResultControl?: boolean;
  /** Sticky map-click (toolbar immediately mode). */
  immediately?: boolean | (() => boolean);
  callMap?: (fn: (map: MapSimple) => void) => void;
  translateAllLayers?: () => string;
  onStateChange?: (state: IdentifyControlModelState) => void;
  /** Wait cursor while querying (host sets map canvas cursor). */
  setCursor?: (cursor: string) => void;
  /** Sync IdentifyResult panel (loading / origin / filters). */
  syncResultPanel?: (extra?: IdentifyResultUpdatePayload) => void;
  /** Host: useEventMap add/remove for click. */
  onEventClickActive?: (active: boolean) => void;
  /** Host: useEventMap add/remove for bbox ranger. */
  onEventBoxSelectActive?: (active: boolean) => void;
  /** Host highlight / other side effects after closeAndCleanup. */
  onCloseSideEffects?: () => void;
};

export type IdentifyInputModeFlags = {
  mapClickActive: boolean;
  boxSelectActive: boolean;
};

export type IdentifySession = {
  getModel: () => IdentifyControlModel;
  getState: () => IdentifyControlModelState;
  getInputModeFlags: () => IdentifyInputModeFlags;
  /** Point identify: sets origin, shows panel loading, runs multi. */
  runAtPoint: (
    lng: number,
    lat: number,
    point: PointLike,
    event?: MapMouseEvent,
  ) => Promise<RunIdentifyResult | undefined>;
  /** Bbox identify: opens show, runs multi on box corners. */
  runAtBox: (
    box: [PointLike, PointLike],
  ) => Promise<RunIdentifyResult | undefined>;
  applyScopedSession: (
    result?: IdentifyScopeToggleResult,
  ) => IdentifyScopedSessionResult;
  finishScopedSession: (resolved: IdentifyScopedSessionResult) => void;
  toggleShow: () => IdentifySessionToggleResult;
  applyToggleShowEffects: (resolved: IdentifySessionToggleResult) => void;
  close: () => ReturnType<IdentifyControlModel['close']>;
  closeAndCleanup: () => ReturnType<IdentifyControlModel['close']>;
  setLayerFilter: (identifyId: string) => {
    filterId: string | undefined;
    shouldRequery: boolean;
    panel: IdentifyResultUpdatePayload;
  };
  /** setLayerFilter + optional project/requery when callMap is set. */
  applyLayerFilter: (identifyId: string) => Promise<{
    filterId: string | undefined;
    shouldRequery: boolean;
    panel: IdentifyResultUpdatePayload;
  }>;
  setLoading: (loading: boolean) => void;
  setUseClick: (active: boolean) => void;
  setSelectBbox: (active: boolean) => void;
  setShow: (show: boolean) => void;
  enableMapClickMode: () => void;
  disableMapClickMode: () => void;
  toggleMapClickMode: () => void;
  enableBoxSelectMode: () => void;
  disableBoxSelectMode: (options?: { immediate?: boolean }) => void;
  toggleBoxSelectMode: () => void;
  teardownInputModes: (options?: { immediate?: boolean }) => void;
  onMapClick: (event: MapMouseEvent) => void;
  onBboxSelected: (bbox: IdentifyBboxCorners) => void;
  onIdentifyHere: (
    lng: number,
    lat: number,
    screenPoint?: PointLike,
  ) => void;
  buildResultPanelPayload: (
    extra?: IdentifyResultUpdatePayload,
  ) => IdentifyResultUpdatePayload;
  syncFullResultPanel: (extra?: IdentifyResultUpdatePayload) => void;
  destroy: () => void;
};

function emitState(
  model: IdentifyControlModel,
  onStateChange?: (state: IdentifyControlModelState) => void,
) {
  onStateChange?.(model.getState());
}

function resolveImmediately(
  immediately?: boolean | (() => boolean),
): boolean {
  if (typeof immediately === 'function') return !!immediately();
  return !!immediately;
}

/**
 * Owns IdentifyControl query + input-mode lifecycle. Hosts keep EventClick / UI.
 */
export function createIdentifySession(
  options: IdentifySessionOptions,
): IdentifySession {
  const model = createIdentifyControlModel();
  let destroyed = false;
  let unbindLongPress: (() => void) | null = null;
  let removeBoxTimer: ReturnType<typeof setTimeout> | undefined;
  /** Effective flags for panel/guards (box teardown may lag model). */
  let mapClickActive = false;
  let boxSelectActive = false;

  function clearRemoveBoxTimer() {
    if (removeBoxTimer != null) {
      clearTimeout(removeBoxTimer);
      removeBoxTimer = undefined;
    }
  }

  function clearLongPress() {
    unbindLongPress?.();
    unbindLongPress = null;
  }

  async function runQuery(
    input: IdentifyQueryInput,
  ): Promise<RunIdentifyResult | undefined> {
    if (destroyed) return undefined;
    const pointOrBox =
      input.kind === 'point' ? input.point : input.box;
    const event = input.kind === 'point' ? input.event : undefined;

    model.setLoading(true);
    emitState(model, options.onStateChange);
    options.setCursor?.('wait');
    options.syncResultPanel?.({ loading: true });

    try {
      return await runIdentifyMulti({
        identifies: options.getIdentifies(),
        mapId: options.mapId,
        pointOrBox,
        event,
        filterIdentifyId: model.getState().filterIdentifyId,
        preferResultControl: !!options.preferResultControl,
      });
    } finally {
      if (!destroyed) {
        model.setLoading(false);
        emitState(model, options.onStateChange);
        options.setCursor?.('');
        options.syncResultPanel?.({ loading: false });
      }
    }
  }

  function buildResultPanelPayload(
    extra?: IdentifyResultUpdatePayload,
  ): IdentifyResultUpdatePayload {
    const s = model.getState();
    return {
      ...buildIdentifyResultPanelBase({
        loading: s.loading,
        origin: { ...s.origin },
        views: options.getIdentifies(),
        allLayersText: options.translateAllLayers?.() ?? '',
        selectedLayerId: s.filterIdentifyId,
        isEventClickActive: mapClickActive,
        isEventClickBox: boxSelectActive,
      }),
      ...extra,
    };
  }

  function syncFullResultPanel(extra?: IdentifyResultUpdatePayload) {
    options.syncResultPanel?.(buildResultPanelPayload(extra));
  }

  function enableMapClickMode() {
    if (destroyed) return;
    model.setUseClick(true);
    mapClickActive = true;
    emitState(model, options.onStateChange);
    options.onEventClickActive?.(true);
    options.syncResultPanel?.({ isEventClickActive: true });
    clearLongPress();
    if (shouldBindIdentifyLongPress() && options.callMap) {
      options.callMap((map) => {
        unbindLongPress = bindMapLongPress(map, {
          onLongPress: (point) => {
            if (boxSelectActive || destroyed) return;
            const lngLat = map.unproject([point.x, point.y]);
            void session.runAtPoint(lngLat.lng, lngLat.lat, [
              point.x,
              point.y,
            ]);
          },
        });
      });
    }
  }

  function disableMapClickMode() {
    if (destroyed) return;
    model.setUseClick(false);
    mapClickActive = false;
    emitState(model, options.onStateChange);
    options.onEventClickActive?.(false);
    clearLongPress();
    options.syncResultPanel?.({ isEventClickActive: false });
  }

  function enableBoxSelectMode() {
    if (destroyed) return;
    model.setSelectBbox(true);
    boxSelectActive = true;
    emitState(model, options.onStateChange);
    options.onEventBoxSelectActive?.(true);
    options.syncResultPanel?.({ isEventClickBox: true });
  }

  function disableBoxSelectMode(opts?: { immediate?: boolean }) {
    if (destroyed) return;
    model.setSelectBbox(false);
    emitState(model, options.onStateChange);
    clearRemoveBoxTimer();
    const finish = () => {
      removeBoxTimer = undefined;
      boxSelectActive = false;
      options.onEventBoxSelectActive?.(false);
      options.syncResultPanel?.({ isEventClickBox: false });
    };
    if (opts?.immediate) {
      finish();
      return;
    }
    removeBoxTimer = setTimeout(finish, 500);
  }

  function teardownInputModes(opts?: { immediate?: boolean }) {
    if (resolveImmediately(options.immediately)) return;
    disableMapClickMode();
    disableBoxSelectMode({ immediate: opts?.immediate ?? true });
  }

  const session: IdentifySession = {
    getModel: () => model,
    getState: () => model.getState(),
    getInputModeFlags: () => ({ mapClickActive, boxSelectActive }),

    async runAtPoint(lng, lat, point, event) {
      if (destroyed) return undefined;
      model.setOrigin(lat, lng);
      emitState(model, options.onStateChange);
      return runQuery({ kind: 'point', point, event });
    },

    async runAtBox(box) {
      if (destroyed) return undefined;
      model.setShow(true);
      emitState(model, options.onStateChange);
      return runQuery({ kind: 'box', box });
    },

    applyScopedSession(result) {
      const resolved = model.applyScopedSession(result);
      emitState(model, options.onStateChange);
      return resolved;
    },

    finishScopedSession(resolved) {
      if (destroyed) return;
      if (resolved.kind === 'activate') {
        syncFullResultPanel(resolved.panel);
        if (resolved.startMapClick) enableMapClickMode();
        return;
      }
      if (resolved.kind === 'clear-matching') {
        syncFullResultPanel(resolved.panel);
      }
      if (
        'removeMapClickIfNotImmediate' in resolved &&
        resolved.removeMapClickIfNotImmediate &&
        !resolveImmediately(options.immediately)
      ) {
        disableMapClickMode();
      }
    },

    toggleShow() {
      const resolved = model.toggleShow();
      emitState(model, options.onStateChange);
      return resolved;
    },

    applyToggleShowEffects(resolved) {
      if (destroyed) return;
      syncFullResultPanel(resolved.panel);
      if (resolved.startMapClick) enableMapClickMode();
      else if (resolved.removeIdentify) teardownInputModes({ immediate: true });
    },

    close() {
      const closed = model.close();
      emitState(model, options.onStateChange);
      return closed;
    },

    closeAndCleanup() {
      const closed = model.close();
      emitState(model, options.onStateChange);
      clearIdentifyScope(options.mapId);
      teardownInputModes({ immediate: true });
      options.onCloseSideEffects?.();
      syncFullResultPanel(closed.panel);
      return closed;
    },

    setLayerFilter(identifyId) {
      const filterId = resolveIdentifyLayerFilterId(identifyId);
      model.setFilterIdentifyId(filterId);
      emitState(model, options.onStateChange);
      const origin = model.getState().origin;
      const shouldRequery = origin.latitude !== 0 || origin.longitude !== 0;
      return {
        filterId,
        shouldRequery,
        panel: {
          selectedLayerId: filterId ?? IDENTIFY_ALL_LAYERS_VALUE,
        },
      };
    },

    async applyLayerFilter(identifyId) {
      const filtered = session.setLayerFilter(identifyId);
      options.syncResultPanel?.(filtered.panel);
      if (filtered.shouldRequery && options.callMap) {
        const origin = model.getState().origin;
        await new Promise<void>((resolve) => {
          options.callMap!((map) => {
            const point = map.project([origin.longitude, origin.latitude]);
            void session
              .runAtPoint(origin.longitude, origin.latitude, point)
              .finally(resolve);
          });
        });
      }
      return filtered;
    },

    setLoading(loading) {
      model.setLoading(loading);
      emitState(model, options.onStateChange);
      options.syncResultPanel?.({ loading });
    },

    setUseClick(active) {
      model.setUseClick(active);
      emitState(model, options.onStateChange);
    },

    setSelectBbox(active) {
      model.setSelectBbox(active);
      emitState(model, options.onStateChange);
    },

    setShow(show) {
      model.setShow(show);
      emitState(model, options.onStateChange);
    },

    enableMapClickMode,
    disableMapClickMode,
    toggleMapClickMode() {
      if (model.getState().isUseClick) disableMapClickMode();
      else enableMapClickMode();
    },
    enableBoxSelectMode,
    disableBoxSelectMode,
    toggleBoxSelectMode() {
      if (model.getState().isSelectBbox) disableBoxSelectMode();
      else enableBoxSelectMode();
    },
    teardownInputModes,

    onMapClick(event) {
      if (destroyed || boxSelectActive) return;
      model.setOrigin(event.lngLat.lat, event.lngLat.lng);
      emitState(model, options.onStateChange);
      void runQuery({ kind: 'point', point: event.point, event });
    },

    onBboxSelected(bbox) {
      if (destroyed || mapClickActive) return;
      disableBoxSelectMode();
      if (!bbox) return;
      model.setShow(true);
      emitState(model, options.onStateChange);
      void runQuery({
        kind: 'box',
        box: [
          [bbox[0].x, bbox[0].y],
          [bbox[1].x, bbox[1].y],
        ],
      });
    },

    onIdentifyHere(lng, lat, screenPoint) {
      if (destroyed) return;
      if (screenPoint) {
        model.setOrigin(lat, lng);
        emitState(model, options.onStateChange);
        void runQuery({ kind: 'point', point: screenPoint });
        return;
      }
      options.callMap?.((map) => {
        const point = map.project([lng, lat]);
        model.setOrigin(lat, lng);
        emitState(model, options.onStateChange);
        void runQuery({ kind: 'point', point });
      });
    },

    buildResultPanelPayload,
    syncFullResultPanel,

    destroy() {
      destroyed = true;
      clearRemoveBoxTimer();
      clearLongPress();
      mapClickActive = false;
      boxSelectActive = false;
      options.onEventClickActive?.(false);
      options.onEventBoxSelectActive?.(false);
      model.close();
      model.setUseClick(false);
      model.setSelectBbox(false);
      emitState(model, options.onStateChange);
    },
  };

  return session;
}

export type { IdentifyLayerFilterPayload };
