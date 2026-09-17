import { getMapPointerProfile } from '@hungpvq/map-core';
import type { IdentifyScopeToggleResult } from './scope';
import {
  IDENTIFY_ALL_LAYERS_VALUE,
  type IdentifyResultUpdatePayload,
} from './result';

export type IdentifyControlModelState = {
  show: boolean;
  loading: boolean;
  filterIdentifyId?: string;
  origin: { latitude: number; longitude: number };
  isUseClick: boolean;
  isSelectBbox: boolean;
};

const clearedOrigin = (): { latitude: number; longitude: number } => ({
  latitude: 0,
  longitude: 0,
});

/** Panel payload after IdentifyControl close. */
export function buildIdentifyClosePanelPayload(): IdentifyResultUpdatePayload {
  return {
    show: false,
    loading: false,
    origin: clearedOrigin(),
    selectedLayerId: IDENTIFY_ALL_LAYERS_VALUE,
    items: [],
  };
}

/** Coarse pointer → bind long-press for Identify map click mode. */
export function shouldBindIdentifyLongPress(
  profile: { coarse: boolean } = getMapPointerProfile(),
): boolean {
  return profile.coarse;
}

export type IdentifyScopedSessionResult =
  | {
      kind: 'activate';
      filterIdentifyId: string;
      startMapClick: boolean;
      panel: IdentifyResultUpdatePayload;
    }
  | {
      kind: 'clear-matching';
      removeMapClickIfNotImmediate: true;
      panel: IdentifyResultUpdatePayload;
    }
  | {
      kind: 'noop';
      removeMapClickIfNotImmediate: true;
      panel?: undefined;
    };

/**
 * Layer-item one-way scoped identify session (do not open result popup).
 */
export function resolveIdentifyScopedSession(
  result: IdentifyScopeToggleResult | undefined,
  current: {
    filterIdentifyId?: string;
    isUseClick: boolean;
  },
): IdentifyScopedSessionResult {
  const origin = clearedOrigin();
  if (result?.active && result.identifyId) {
    return {
      kind: 'activate',
      filterIdentifyId: result.identifyId,
      startMapClick: !current.isUseClick,
      panel: {
        selectedLayerId: result.identifyId,
        items: [],
        loading: false,
        origin,
      },
    };
  }
  if (
    result?.identifyId &&
    current.filterIdentifyId &&
    current.filterIdentifyId === result.identifyId
  ) {
    return {
      kind: 'clear-matching',
      removeMapClickIfNotImmediate: true,
      panel: {
        selectedLayerId: IDENTIFY_ALL_LAYERS_VALUE,
        items: [],
        loading: false,
        origin,
      },
    };
  }
  return { kind: 'noop', removeMapClickIfNotImmediate: true };
}

export type IdentifySessionToggleResult = {
  show: boolean;
  panel: IdentifyResultUpdatePayload;
  startMapClick: boolean;
  removeIdentify: boolean;
};

export function resolveIdentifySessionToggle(
  show: boolean,
  isUseClick: boolean,
): IdentifySessionToggleResult {
  const next = !show;
  return {
    show: next,
    panel: { show: next },
    startMapClick: next && !isUseClick,
    removeIdentify: !next,
  };
}

/**
 * Mutable IdentifyControl session model (framework-agnostic).
 * Adapters own event listeners, registry actions, and UI; this owns session state
 * + panel payloads for scoped / toggle / close.
 */
export function createIdentifyControlModel(
  initial: Partial<IdentifyControlModelState> = {},
) {
  const state: IdentifyControlModelState = {
    show: false,
    loading: false,
    filterIdentifyId: undefined,
    origin: clearedOrigin(),
    isUseClick: false,
    isSelectBbox: false,
    ...initial,
  };

  return {
    getState(): IdentifyControlModelState {
      return {
        ...state,
        origin: { ...state.origin },
      };
    },

    setUseClick(active: boolean) {
      state.isUseClick = active;
    },

    setSelectBbox(active: boolean) {
      state.isSelectBbox = active;
    },

    setLoading(loading: boolean) {
      state.loading = loading;
    },

    setOrigin(latitude: number, longitude: number) {
      state.origin = { latitude, longitude };
    },

    setFilterIdentifyId(id: string | undefined) {
      state.filterIdentifyId = id;
    },

    setShow(show: boolean) {
      state.show = show;
    },

    applyScopedSession(
      result?: IdentifyScopeToggleResult,
    ): IdentifyScopedSessionResult {
      const resolved = resolveIdentifyScopedSession(result, {
        filterIdentifyId: state.filterIdentifyId,
        isUseClick: state.isUseClick,
      });
      if (resolved.kind === 'activate') {
        state.filterIdentifyId = resolved.filterIdentifyId;
        state.show = true;
        state.origin = clearedOrigin();
      } else if (resolved.kind === 'clear-matching') {
        state.filterIdentifyId = undefined;
        state.origin = clearedOrigin();
      }
      return resolved;
    },

    toggleShow(): IdentifySessionToggleResult {
      const resolved = resolveIdentifySessionToggle(
        state.show,
        state.isUseClick,
      );
      state.show = resolved.show;
      return resolved;
    },

    close(): {
      clearScope: true;
      hideHighlight: true;
      removeIdentify: true;
      panel: IdentifyResultUpdatePayload;
    } {
      state.filterIdentifyId = undefined;
      state.show = false;
      state.loading = false;
      state.origin = clearedOrigin();
      return {
        clearScope: true,
        hideHighlight: true,
        removeIdentify: true,
        panel: buildIdentifyClosePanelPayload(),
      };
    },
  };
}

export type IdentifyControlModel = ReturnType<typeof createIdentifyControlModel>;
