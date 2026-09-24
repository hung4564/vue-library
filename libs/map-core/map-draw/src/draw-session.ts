/**
 * Framework-agnostic DrawControl session: draw.* handlers, select/delete
 * map-click, and mode orchestration. Hosts keep EventClick / drafts / UI.
 */

import type { Feature } from 'geojson';
import type { MapMouseEvent } from 'maplibre-gl';

import {
  classifyDrawCreateFeature,
  type DrawMapClickResult,
  ensureFeatureId,
  getDrawCreateModeEffects,
  getDrawModeSelectEffects,
  handleDrawMapClick,
  type MapDrawEditControl,
} from './draw-control-helpers';
import { isDraftOption } from './is-draft-option';
import type {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawUpdateEvent,
} from './mapbox-draw';
import type { MapDrawOption } from './types/index';

export type DrawSessionState = {
  method: string;
  isDraw: boolean;
  currentFeature: Feature | undefined;
};

export type DrawSessionOptions = {
  mapId: string;
  control: MapDrawEditControl;
  getDrawOption: () => MapDrawOption | undefined;
  setFeature: (type: 'added' | 'updated' | 'deleted', feature: Feature) => void;
  onStateChange?: (state: DrawSessionState) => void;
  /** Host wires useEventMap add/remove. */
  setMapClickActive?: (active: boolean) => void;
  /** Default: queueMicrotask. Vue hosts pass nextTick. */
  schedule?: (fn: () => void) => void;
  /** After delete (and optional cancel): redraw non-draft sources. */
  redrawNonDraft?: () => void | Promise<void>;
};

export type DrawMapDrawHandlers = {
  onDrawCreated: (e: DrawCreateEvent) => void;
  onDrawUpdated: (e: DrawUpdateEvent) => void;
  onDrawDeleted: (e: DrawDeleteEvent) => void;
};

export type DrawSession = {
  getState: () => DrawSessionState;
  getMapDrawHandlers: () => DrawMapDrawHandlers;
  handleMapClick: (e: MapMouseEvent) => Promise<DrawMapClickResult>;
  selectMethod: (value: 'select' | 'delete') => void;
  startCreate: (drawMode: string) => void;
  setMethod: (method: string) => void;
  setIsDraw: (isDraw: boolean) => void;
  setCurrentFeature: (feature: Feature | undefined) => void;
  /** Reset to select + clear edit UI state before host persists. */
  prepareSave: () => void;
  /**
   * Cancel edit: optional host callback with current feature, then select reset
   * and `redrawNonDraft` once. No-op after destroy.
   */
  finishCancel: (
    onCancel?: (feature: Feature | undefined) => void,
  ) => Promise<void>;
  redrawNonDraft: () => Promise<void>;
  destroy: () => void;
};

function cloneState(state: DrawSessionState): DrawSessionState {
  return {
    method: state.method,
    isDraw: state.isDraw,
    currentFeature: state.currentFeature,
  };
}

/**
 * Owns DrawControl event orchestration. Hosts keep chrome UI + EventClick.
 */
export function createDrawSession(options: DrawSessionOptions): DrawSession {
  const state: DrawSessionState = {
    method: '',
    isDraw: false,
    currentFeature: undefined,
  };
  let destroyed = false;
  const schedule = options.schedule ?? ((fn) => queueMicrotask(fn));

  function emit() {
    options.onStateChange?.(cloneState(state));
  }

  function detachMapClick() {
    options.setMapClickActive?.(false);
  }

  function attachMapClick() {
    options.setMapClickActive?.(true);
  }

  const handlers: DrawMapDrawHandlers = {
    onDrawCreated(event) {
      if (destroyed) return;
      for (const feature of event.features) {
        const kind = classifyDrawCreateFeature(state.method);
        options.setFeature(
          kind,
          kind === 'updated' ? ensureFeatureId(feature) : feature,
        );
      }
    },
    onDrawUpdated(event) {
      if (destroyed) return;
      for (const feature of event.features) {
        options.setFeature('updated', feature);
      }
    },
    onDrawDeleted(event) {
      if (destroyed) return;
      for (const feature of event.features) {
        options.setFeature('deleted', feature);
      }
      schedule(() => {
        if (destroyed) return;
        session.selectMethod('select');
      });
    },
  };

  const session: DrawSession = {
    getState: () => cloneState(state),
    getMapDrawHandlers: () => handlers,

    async handleMapClick(e) {
      if (destroyed) return { kind: 'none' };
      const result = await handleDrawMapClick({
        method: state.method,
        drawOption: options.getDrawOption(),
        control: options.control,
        mapId: options.mapId,
        point: [e.lngLat.lng, e.lngLat.lat],
        setFeature: options.setFeature,
        detachMapClick,
      });
      if (destroyed) return result;
      if (result.kind === 'none') {
        state.currentFeature = undefined;
        emit();
        return result;
      }
      state.currentFeature = result.feature;
      if (result.kind === 'select' && result.enteredEdit) {
        state.isDraw = true;
      }
      emit();
      if (result.kind === 'delete') {
        await session.redrawNonDraft();
      }
      return result;
    },

    selectMethod(value) {
      if (destroyed) return;
      detachMapClick();
      state.method = value;
      emit();
      const effects = getDrawModeSelectEffects(value);
      if (effects.attachMapClick) attachMapClick();
      options.control.changeMode(effects.drawMode);
    },

    startCreate(drawMode) {
      if (destroyed) return;
      detachMapClick();
      const effects = getDrawCreateModeEffects(drawMode);
      state.method = effects.method;
      state.isDraw = effects.isDraw;
      emit();
      options.control.changeMode(effects.drawMode);
    },

    setMethod(method) {
      if (destroyed) return;
      state.method = method;
      emit();
    },

    setIsDraw(isDraw) {
      if (destroyed) return;
      state.isDraw = isDraw;
      emit();
    },

    setCurrentFeature(feature) {
      if (destroyed) return;
      state.currentFeature = feature;
      emit();
    },

    prepareSave() {
      if (destroyed) return;
      session.selectMethod('select');
      state.isDraw = false;
      state.currentFeature = undefined;
      emit();
    },

    async finishCancel(onCancel) {
      if (destroyed) return;
      const feature = state.currentFeature;
      onCancel?.(feature);
      if (destroyed) return;
      state.isDraw = false;
      state.currentFeature = undefined;
      emit();
      session.selectMethod('select');
      await session.redrawNonDraft();
    },

    async redrawNonDraft() {
      if (destroyed) return;
      const action = options.getDrawOption();
      if (action && !isDraftOption(action)) {
        if (options.redrawNonDraft) {
          await options.redrawNonDraft();
        } else {
          await action.redraw?.(options.mapId);
        }
      }
    },

    destroy() {
      destroyed = true;
      detachMapClick();
      state.method = '';
      state.isDraw = false;
      state.currentFeature = undefined;
      emit();
    },
  };

  return session;
}
