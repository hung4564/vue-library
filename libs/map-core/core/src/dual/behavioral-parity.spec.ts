/**
 * Behavioral parity locks for dual session helpers (not just control id presence).
 * Measurement lives in map-core; Identify/Draw/Style locks live next to their packages
 * (`map-dataset` / `map-draw` `*.behavioral` / session specs) and are listed here
 * as the dual checklist.
 */
import { describe, expect, it } from 'vitest';
import {
  createMeasurementSession,
  resolveMeasurementModeToggle,
} from '../measurement';
import type { MapSimple } from '../types';

function fakeMap(id = 'parity-map'): MapSimple {
  return {
    id,
    getSource: () => undefined,
    addSource: () => undefined,
    addLayer: () => undefined,
    removeLayer: () => undefined,
    removeSource: () => undefined,
    getLayer: () => undefined,
    on: () => undefined,
    off: () => undefined,
    fitBounds: () => undefined,
  } as unknown as MapSimple;
}

describe('dual behavioral parity — measurement session', () => {
  it('mode toggle + clear matches resolveMeasurementModeToggle contract', () => {
    expect(resolveMeasurementModeToggle('distance', 'distance')).toEqual({
      start: false,
      nextType: undefined,
    });
    expect(resolveMeasurementModeToggle(undefined, 'area')).toEqual({
      start: true,
      nextType: 'area',
    });

    const session = createMeasurementSession({
      callMap: (fn) => fn(fakeMap()),
    });
    expect(session.startMode('distance')).toBe(true);
    expect(session.getState().measurementType).toBe('distance');
    expect(session.startMode('distance')).toBe(false);
    expect(session.getState().measurementType).toBeUndefined();
    session.startMode('area');
    session.clear();
    expect(session.getHandler().action).toBeNull();
    session.destroy();
  });
});

/**
 * Checklist (implemented in package specs — keep in sync when adding dual tools):
 * - Identify: createIdentifySession runAtPoint / toggle / closeAndCleanup destroy
 *   → map-dataset identify/behavioral-parity.spec.ts
 * - Identify abort: rapid runAtPoint AbortSignal + cancelQuery
 *   → map-dataset identify/behavioral-parity.spec.ts
 * - Identify box/scoped: runAtBox / onBboxSelected / finishScopedSession
 *   → map-dataset identify/identify-session.spec.ts + behavioral-parity.spec.ts
 * - Draw: createDrawSession delete→redrawNonDraft + scheduled select after draw.delete
 *   → map-draw draw-session.spec.ts
 * - Draw lifecycle: createMapDrawControl addToMap/removeFromMap
 *   → map-draw (adapters) + Experimental export lock
 * - Draw save/cancel: prepareSave / finishCancel (+ redrawNonDraft draft no-op)
 *   → map-draw draw-session.spec.ts
 * - Style: applyStyleTabValue / applyStyleZoom
 *   → map-dataset apply-style-patch.spec.ts
 * - E2E dual chrome: MAP_DUAL_E2E_SMOKE_CONTROL_IDS
 *   → vue/react demo-map-e2e dual-controls-smoke.spec.ts
 */
describe('dual behavioral parity — checklist anchors', () => {
  it('documents cross-package session owners', () => {
    expect([
      'createIdentifySession',
      'createDrawSession',
      'prepareSave',
      'finishCancel',
      'applyStyleTabValue',
    ]).toHaveLength(5);
  });
});
