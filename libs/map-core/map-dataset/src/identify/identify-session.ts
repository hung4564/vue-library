/**
 * Framework-agnostic IdentifyControl session: model state + runIdentifyMulti
 * pipeline + map-click/bbox mode orchestration. Hosts wire EventClick /
 * EventBbox / registry / UI / highlight store.
 *
 * Click/bbox mode SoT = host useEventMap.isActive via getEventClickActive /
 * getEventBoxSelectActive (not mirrored model flags).
 */

import { bindMapLongPress, type MapSimple } from '@hungpvq/map-core';
import { loggerFactory, runWithFunctionLog } from '@hungpvq/shared-log';
import type { MapMouseEvent, PointLike } from 'maplibre-gl';

import type { IIdentifyView } from '../interfaces/dataset.parts';
import {
  createIdentifyControlModel,
  type IdentifyControlModel,
  type IdentifyControlModelState,
  type IdentifySessionToggleResult,
  shouldBindIdentifyLongPress,
} from './control-model';
import {
  IDENTIFY_ALL_LAYERS_VALUE,
  type IdentifyResultUpdatePayload,
} from './result';
import {
  buildIdentifyResultPanelBase,
  isIdentifyAbortError,
  resolveIdentifyLayerFilterId,
  runIdentifyMulti,
  type RunIdentifyResult,
} from './run-identify';
import {
  clearIdentifyScope,
  type IdentifyLayerFilterPayload,
  type IdentifyScopeToggleResult,
} from './scope';

export type IdentifyQueryInput =
  | { kind: 'point'; point: PointLike; event?: MapMouseEvent }
  | { kind: 'box'; box: [PointLike, PointLike] };

export type IdentifyBboxCorners =
  [{ x: number; y: number }, { x: number; y: number }] | null | undefined;

export type IdentifySessionOptions = {
  getIdentifies: () => IIdentifyView[];
  mapId: string;
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
  /** Host: EventClick currently registered (useEventMap.isActive). */
  getEventClickActive?: () => boolean;
  /** Host: EventBbox currently registered (useEventMap.isActive). */
  getEventBoxSelectActive?: () => boolean;
  /** Host highlight / other side effects after closeAndCleanup. */
  onCloseSideEffects?: () => void;
};

export type IdentifySession = {
  getModel: () => IdentifyControlModel;
  getState: () => IdentifyControlModelState;
  runAtPoint: (
    lng: number,
    lat: number,
    point: PointLike,
    event?: MapMouseEvent,
  ) => Promise<RunIdentifyResult | undefined>;
  runAtBox: (
    box: [PointLike, PointLike],
  ) => Promise<RunIdentifyResult | undefined>;
  /** Resolve scoped intent + start/stop map-click / panel sync. */
  applyScopedAndFinish: (result?: IdentifyScopeToggleResult) => void;
  /** Toggle toolbar show + start/stop input modes. */
  toggleShowAndApply: () => IdentifySessionToggleResult;
  close: () => ReturnType<IdentifyControlModel['close']>;
  closeAndCleanup: () => ReturnType<IdentifyControlModel['close']>;
  setLayerFilter: (identifyId: string) => {
    filterId: string | undefined;
    shouldRequery: boolean;
    panel: IdentifyResultUpdatePayload;
  };
  applyLayerFilter: (identifyId: string) => Promise<{
    filterId: string | undefined;
    shouldRequery: boolean;
    panel: IdentifyResultUpdatePayload;
  }>;
  setLoading: (loading: boolean) => void;
  setShow: (show: boolean) => void;
  enableMapClickMode: () => void;
  disableMapClickMode: () => void;
  toggleMapClickMode: () => void;
  enableBoxSelectMode: () => void;
  /**
   * Tear down bbox event. Default delays 500ms so the map click that ends a
   * drag does not fire identify; pass `{ immediate: true }` for UI toggle-off.
   */
  disableBoxSelectMode: (options?: { immediate?: boolean }) => void;
  toggleBoxSelectMode: () => void;
  teardownInputModes: (options?: { immediate?: boolean }) => void;
  onMapClick: (event: MapMouseEvent) => void;
  onBboxSelected: (bbox: IdentifyBboxCorners) => void;
  onIdentifyHere: (lng: number, lat: number, screenPoint?: PointLike) => void;
  buildResultPanelPayload: (
    extra?: IdentifyResultUpdatePayload,
  ) => IdentifyResultUpdatePayload;
  cancelQuery: () => void;
  destroy: () => void;
};

function emitState(
  model: IdentifyControlModel,
  onStateChange?: (state: IdentifyControlModelState) => void,
) {
  onStateChange?.(model.getState());
}

function resolveImmediately(immediately?: boolean | (() => boolean)): boolean {
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
  let queryAbort: AbortController | null = null;
  let queryGeneration = 0;

  /** EventClick registered? Host SoT via getEventClickActive. */
  function isEventClickActive(): boolean {
    return !!options.getEventClickActive?.();
  }

  /** EventBbox registered? Host SoT via getEventBoxSelectActive. */
  function isEventBoxSelectActive(): boolean {
    return !!options.getEventBoxSelectActive?.();
  }

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

  function clearLoadingUi() {
    model.setLoading(false);
    emitState(model, options.onStateChange);
    options.setCursor?.('');
    options.syncResultPanel?.({ loading: false });
  }

  function cancelQuery() {
    queryAbort?.abort();
    queryAbort = null;
    if (!destroyed && model.getState().loading) {
      clearLoadingUi();
    }
  }

  async function runQuery(
    input: IdentifyQueryInput,
  ): Promise<RunIdentifyResult | undefined> {
    if (destroyed) return undefined;
    return loggerFactory.ensureActionContext(
      { mapId: options.mapId, span: 'identify.query', fn: 'runQuery' },
      async () =>
        runWithFunctionLog(
          loggerFactory.createLogger().setNamespace('map:identify', 2),
          {
            fn: 'runQuery',
            span: 'identify.query',
            mapId: options.mapId,
          },
          async () => {
            const pointOrBox = input.kind === 'point' ? input.point : input.box;
            const event = input.kind === 'point' ? input.event : undefined;

            queryAbort?.abort();
            const ac = new AbortController();
            queryAbort = ac;
            const generation = ++queryGeneration;

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
                signal: ac.signal,
                requestId: generation,
              });
            } catch (error) {
              if (isIdentifyAbortError(error) || ac.signal.aborted) {
                return undefined;
              }
              if (!destroyed && generation === queryGeneration) {
                const message =
                  error instanceof Error
                    ? error.message
                    : String(error ?? 'Identify failed');
                options.syncResultPanel?.({ error: message, loading: false });
                clearLoadingUi();
              }
              return undefined;
            } finally {
              if (queryAbort === ac) {
                queryAbort = null;
              }
              if (!destroyed && generation === queryGeneration) {
                if (model.getState().loading) {
                  clearLoadingUi();
                }
              }
            }
          },
        ),
    );
  }

  function buildResultPanelPayload(
    extra?: IdentifyResultUpdatePayload,
  ): IdentifyResultUpdatePayload {
    const s = model.getState();
    // Mode button flags: host watches useEventMap.isActive only.
    return {
      ...buildIdentifyResultPanelBase({
        loading: s.loading,
        origin: { ...s.origin },
        views: options.getIdentifies(),
        allLayersText: options.translateAllLayers?.() ?? '',
        selectedLayerId: s.filterIdentifyId,
      }),
      ...extra,
    };
  }

  function syncFullResultPanel(extra?: IdentifyResultUpdatePayload) {
    options.syncResultPanel?.(buildResultPanelPayload(extra));
  }

  function enableMapClickMode() {
    if (destroyed) return;
    options.onEventClickActive?.(true);
    clearLongPress();
    if (shouldBindIdentifyLongPress() && options.callMap) {
      options.callMap((map) => {
        unbindLongPress = bindMapLongPress(map, {
          onLongPress: (point) => {
            if (isEventBoxSelectActive() || destroyed) return;
            const lngLat = map.unproject([point.x, point.y]);
            void session.runAtPoint(lngLat.lng, lngLat.lat, [point.x, point.y]);
          },
        });
      });
    }
  }

  function disableMapClickMode() {
    if (destroyed) return;
    options.onEventClickActive?.(false);
    clearLongPress();
  }

  function enableBoxSelectMode() {
    if (destroyed) return;
    clearRemoveBoxTimer();
    options.onEventBoxSelectActive?.(true);
  }

  function disableBoxSelectMode(opts?: { immediate?: boolean }) {
    if (destroyed) return;
    clearRemoveBoxTimer();
    const finish = () => {
      removeBoxTimer = undefined;
      options.onEventBoxSelectActive?.(false);
    };
    if (opts?.immediate) {
      finish();
      return;
    }
    // After a bbox drag ends, delay remove so the mouseup/click does not
    // also fire EventClick identify. UI toggle-off should pass immediate.
    removeBoxTimer = setTimeout(finish, 500);
  }

  function teardownInputModes(opts?: { immediate?: boolean }) {
    if (resolveImmediately(options.immediately)) return;
    disableMapClickMode();
    disableBoxSelectMode({ immediate: opts?.immediate ?? true });
  }

  function finishScopedSession(
    resolved: ReturnType<IdentifyControlModel['applyScopedSession']>,
  ) {
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
  }

  function applyToggleShowEffects(resolved: IdentifySessionToggleResult) {
    if (destroyed) return;
    syncFullResultPanel(resolved.panel);
    if (resolved.startMapClick) enableMapClickMode();
    else if (resolved.removeIdentify) teardownInputModes({ immediate: true });
  }

  const session: IdentifySession = {
    getModel: () => model,
    getState: () => model.getState(),

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

    applyScopedAndFinish(result) {
      const resolved = model.applyScopedSession(result, isEventClickActive());
      emitState(model, options.onStateChange);
      finishScopedSession(resolved);
    },

    toggleShowAndApply() {
      const resolved = model.toggleShow(isEventClickActive());
      emitState(model, options.onStateChange);
      applyToggleShowEffects(resolved);
      return resolved;
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

    setShow(show) {
      model.setShow(show);
      emitState(model, options.onStateChange);
    },

    enableMapClickMode,
    disableMapClickMode,
    toggleMapClickMode() {
      if (isEventClickActive()) disableMapClickMode();
      else enableMapClickMode();
    },
    enableBoxSelectMode,
    disableBoxSelectMode,
    toggleBoxSelectMode() {
      if (isEventBoxSelectActive()) {
        disableBoxSelectMode({ immediate: true });
      } else {
        enableBoxSelectMode();
      }
    },
    teardownInputModes,

    onMapClick(event) {
      if (destroyed || isEventBoxSelectActive()) return;
      model.setOrigin(event.lngLat.lat, event.lngLat.lng);
      emitState(model, options.onStateChange);
      void runQuery({ kind: 'point', point: event.point, event });
    },

    onBboxSelected(bbox) {
      if (destroyed || isEventClickActive()) return;
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
    cancelQuery,

    destroy() {
      destroyed = true;
      cancelQuery();
      clearRemoveBoxTimer();
      clearLongPress();
      options.onEventClickActive?.(false);
      options.onEventBoxSelectActive?.(false);
      model.close();
      emitState(model, options.onStateChange);
    },
  };

  return session;
}

export type { IdentifyLayerFilterPayload };
