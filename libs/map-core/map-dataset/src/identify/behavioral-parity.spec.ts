import { describe, expect, it, vi } from 'vitest';
import { createIdentifySession } from './identify-session';
import * as runIdentify from './run-identify';

/**
 * Dual Vue/React Identify behavioral locks (session SoT).
 */
describe('dual behavioral parity — identify session', () => {
  it('point → loading → destroy cleanup', async () => {
    const spy = vi.spyOn(runIdentify, 'runIdentifyMulti').mockResolvedValue({
      records: [],
      hitCount: 0,
      featureCount: 0,
      durationMs: 1,
      empty: true,
    });
    const boxFlags: boolean[] = [];
    const session = createIdentifySession({
      mapId: 'parity-identify',
      getIdentifies: () => [],
      onEventBoxSelectActive: (a) => boxFlags.push(a),
    });
    await session.runAtPoint(105, 21, [10, 20]);
    expect(session.getState().origin).toEqual({
      latitude: 21,
      longitude: 105,
    });
    session.enableBoxSelectMode();
    expect(session.getInputModeFlags().boxSelectActive).toBe(true);
    session.destroy();
    expect(boxFlags.at(-1)).toBe(false);
    spy.mockRestore();
  });

  it('toggle show effects start map click when opening', () => {
    const clicks: boolean[] = [];
    const session = createIdentifySession({
      mapId: 'parity-identify-2',
      getIdentifies: () => [],
      onEventClickActive: (a) => clicks.push(a),
    });
    const opened = session.toggleShow();
    session.applyToggleShowEffects(opened);
    expect(clicks).toContain(true);
    session.destroy();
  });

  it('closeAndCleanup tears down modes + side effects; destroy is idempotent after', () => {
    const clicks: boolean[] = [];
    const boxes: boolean[] = [];
    const sideEffects = vi.fn();
    const syncPanels: unknown[] = [];
    const session = createIdentifySession({
      mapId: 'parity-identify-teardown',
      getIdentifies: () => [],
      immediately: false,
      onEventClickActive: (a) => clicks.push(a),
      onEventBoxSelectActive: (a) => boxes.push(a),
      onCloseSideEffects: sideEffects,
      syncResultPanel: (p) => syncPanels.push(p),
    });
    session.enableBoxSelectMode();
    expect(session.getInputModeFlags().boxSelectActive).toBe(true);

    session.closeAndCleanup();
    expect(sideEffects).toHaveBeenCalledOnce();
    expect(session.getState().show).toBe(false);
    expect(session.getInputModeFlags()).toEqual({
      mapClickActive: false,
      boxSelectActive: false,
    });
    expect(boxes.at(-1)).toBe(false);

    session.destroy();
    expect(session.getInputModeFlags()).toEqual({
      mapClickActive: false,
      boxSelectActive: false,
    });
    session.onMapClick({
      lngLat: { lng: 1, lat: 2 },
      point: { x: 0, y: 0 },
    } as never);
    expect(syncPanels.some((p) => p && typeof p === 'object')).toBe(true);
  });

  it('scoped activate → panel + map click; clear-matching tears down click', () => {
    const clicks: boolean[] = [];
    const panels: unknown[] = [];
    const session = createIdentifySession({
      mapId: 'parity-scoped',
      getIdentifies: () => [],
      immediately: false,
      onEventClickActive: (a) => clicks.push(a),
      syncResultPanel: (p) => panels.push(p),
    });

    const activated = session.applyScopedSession({
      active: true,
      identifyId: 'L1',
    });
    expect(activated.kind).toBe('activate');
    session.finishScopedSession(activated);
    expect(session.getState().filterIdentifyId).toBe('L1');
    expect(clicks).toContain(true);
    expect(
      panels.some(
        (p) =>
          p &&
          typeof p === 'object' &&
          (p as { selectedLayerId?: string }).selectedLayerId === 'L1',
      ),
    ).toBe(true);

    const cleared = session.applyScopedSession({
      active: false,
      identifyId: 'L1',
    });
    expect(cleared.kind).toBe('clear-matching');
    session.finishScopedSession(cleared);
    expect(session.getState().filterIdentifyId).toBeUndefined();
    expect(clicks.at(-1)).toBe(false);
    session.destroy();
  });

  it('scoped noop disables click when not immediate; leaves click when immediately', () => {
    const clicks: boolean[] = [];
    const session = createIdentifySession({
      mapId: 'parity-scoped-noop',
      getIdentifies: () => [],
      immediately: false,
      onEventClickActive: (a) => clicks.push(a),
    });
    session.enableMapClickMode();
    session.getModel().setFilterIdentifyId('L1');
    const noop = session.applyScopedSession({
      active: false,
      identifyId: 'other',
    });
    expect(noop.kind).toBe('noop');
    session.finishScopedSession(noop);
    expect(clicks.at(-1)).toBe(false);
    session.destroy();

    const clicksImm: boolean[] = [];
    const sessionImm = createIdentifySession({
      mapId: 'parity-scoped-imm',
      getIdentifies: () => [],
      immediately: true,
      onEventClickActive: (a) => clicksImm.push(a),
    });
    sessionImm.enableMapClickMode();
    sessionImm.getModel().setFilterIdentifyId('L1');
    const noopImm = sessionImm.applyScopedSession({
      active: false,
      identifyId: 'other',
    });
    sessionImm.finishScopedSession(noopImm);
    expect(sessionImm.getInputModeFlags().mapClickActive).toBe(true);
    sessionImm.destroy();
  });

  it('immediately:true closeAndCleanup leaves input modes active', () => {
    const session = createIdentifySession({
      mapId: 'parity-immediate-close',
      getIdentifies: () => [],
      immediately: true,
    });
    session.enableMapClickMode();
    session.enableBoxSelectMode();
    session.closeAndCleanup();
    expect(session.getInputModeFlags()).toEqual({
      mapClickActive: true,
      boxSelectActive: true,
    });
    session.destroy();
  });
});
