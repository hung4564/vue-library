import { describe, expect, it, vi } from 'vitest';

import { createIdentifySession } from './identify-session';
import * as runIdentify from './run-identify';

/** Simulate host useEventMap.isActive via onEvent* callbacks. */
function withEventTracking(base: Parameters<typeof createIdentifySession>[0]) {
  let clickActive = false;
  let boxActive = false;
  return createIdentifySession({
    ...base,
    onEventClickActive: (a) => {
      clickActive = a;
      base.onEventClickActive?.(a);
    },
    onEventBoxSelectActive: (a) => {
      boxActive = a;
      base.onEventBoxSelectActive?.(a);
    },
    getEventClickActive: () => clickActive,
    getEventBoxSelectActive: () => boxActive,
  });
}

describe('createIdentifySession', () => {
  it('runAtPoint sets origin and toggles loading around query', async () => {
    const states: boolean[] = [];
    const syncPanels: unknown[] = [];
    const cursors: string[] = [];
    const spy = vi.spyOn(runIdentify, 'runIdentifyMulti').mockResolvedValue({
      records: [],
      hitCount: 0,
      featureCount: 0,
      durationMs: 1,
      empty: true,
    });

    const session = createIdentifySession({
      mapId: 'm1',
      getIdentifies: () => [],
      onStateChange: (s) => states.push(s.loading),
      setCursor: (c) => cursors.push(c),
      syncResultPanel: (p) => syncPanels.push(p),
    });

    await session.runAtPoint(105, 21, [10, 20]);

    expect(session.getState().origin).toEqual({
      latitude: 21,
      longitude: 105,
    });
    expect(states).toEqual([false, true, false]);
    expect(cursors).toEqual(['wait', '']);
    expect(syncPanels).toEqual([{ loading: true }, { loading: false }]);
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
    session.destroy();
  });

  it('runAtPoint surfaces non-abort errors on the result panel', async () => {
    const syncPanels: unknown[] = [];
    const spy = vi
      .spyOn(runIdentify, 'runIdentifyMulti')
      .mockRejectedValue(new Error('boom'));

    const session = createIdentifySession({
      mapId: 'm1',
      getIdentifies: () => [],
      syncResultPanel: (p) => syncPanels.push(p),
    });

    await expect(
      session.runAtPoint(105, 21, [10, 20]),
    ).resolves.toBeUndefined();
    expect(session.getState().loading).toBe(false);
    expect(syncPanels).toEqual(
      expect.arrayContaining([
        { loading: true },
        { error: 'boom', loading: false },
      ]),
    );
    spy.mockRestore();
    session.destroy();
  });

  it('toggleShowAndApply and close update session flags', () => {
    const session = createIdentifySession({
      mapId: 'm1',
      getIdentifies: () => [],
    });
    const opened = session.toggleShowAndApply();
    expect(opened.show).toBe(true);
    expect(session.getState().show).toBe(true);

    const closed = session.close();
    expect(closed.clearScope).toBe(true);
    expect(session.getState().show).toBe(false);
    session.destroy();
  });

  it('toggleShowAndApply enables map click when opening', () => {
    const clickActive: boolean[] = [];
    const session = withEventTracking({
      mapId: 'm1',
      getIdentifies: () => [],
      onEventClickActive: (a) => clickActive.push(a),
    });
    session.toggleShowAndApply();
    expect(clickActive).toEqual([true]);
    session.destroy();
  });

  it('setLayerFilter reports requery when origin is set', async () => {
    vi.spyOn(runIdentify, 'runIdentifyMulti').mockResolvedValue({
      records: [],
      hitCount: 0,
      featureCount: 0,
      durationMs: 0,
      empty: true,
    });
    const session = createIdentifySession({
      mapId: 'm1',
      getIdentifies: () => [],
    });
    await session.runAtPoint(1, 2, [0, 0]);
    const filtered = session.setLayerFilter('layer-a');
    expect(filtered.filterId).toBe('layer-a');
    expect(filtered.shouldRequery).toBe(true);
    session.destroy();
    vi.restoreAllMocks();
  });

  it('destroy clears input modes and ignores further clicks', () => {
    const matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    });
    vi.stubGlobal('matchMedia', matchMedia);

    const clickActive: boolean[] = [];
    const boxActive: boolean[] = [];
    const session = withEventTracking({
      mapId: 'm1',
      getIdentifies: () => [],
      onEventClickActive: (a) => clickActive.push(a),
      onEventBoxSelectActive: (a) => boxActive.push(a),
    });
    session.enableMapClickMode();
    session.enableBoxSelectMode();
    expect(boxActive.at(-1)).toBe(true);
    session.destroy();
    expect(clickActive.at(-1)).toBe(false);
    expect(boxActive.at(-1)).toBe(false);
    session.onMapClick({
      lngLat: { lng: 1, lat: 2 },
      point: { x: 0, y: 0 },
    } as never);
    vi.unstubAllGlobals();
  });

  it('runAtBox sets show and queries with box kind', async () => {
    const spy = vi.spyOn(runIdentify, 'runIdentifyMulti').mockResolvedValue({
      records: [],
      hitCount: 0,
      featureCount: 0,
      durationMs: 1,
      empty: true,
    });
    const session = createIdentifySession({
      mapId: 'm1',
      getIdentifies: () => [],
    });
    const box: [[number, number], [number, number]] = [
      [0, 0],
      [10, 10],
    ];
    await session.runAtBox(box);
    expect(session.getState().show).toBe(true);
    expect(spy).toHaveBeenCalledOnce();
    const arg = spy.mock.calls[0]![0] as {
      pointOrBox: [[number, number], [number, number]];
    };
    expect(arg.pointOrBox).toEqual(box);
    spy.mockRestore();
    session.destroy();
  });

  it('onBboxSelected runs box query; null skips query', async () => {
    const spy = vi.spyOn(runIdentify, 'runIdentifyMulti').mockResolvedValue({
      records: [],
      hitCount: 0,
      featureCount: 0,
      durationMs: 0,
      empty: true,
    });
    const session = withEventTracking({
      mapId: 'm1',
      getIdentifies: () => [],
    });
    session.enableBoxSelectMode();
    session.onBboxSelected(null as never);
    expect(spy).not.toHaveBeenCalled();

    session.enableBoxSelectMode();
    session.onBboxSelected([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
    await Promise.resolve();
    expect(spy).toHaveBeenCalledOnce();
    expect(session.getState().show).toBe(true);
    spy.mockRestore();
    session.destroy();
  });

  it('mutual exclusion: bbox ignored when map click active; click ignored when box active', async () => {
    const matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    });
    vi.stubGlobal('matchMedia', matchMedia);

    const spy = vi.spyOn(runIdentify, 'runIdentifyMulti').mockResolvedValue({
      records: [],
      hitCount: 0,
      featureCount: 0,
      durationMs: 0,
      empty: true,
    });
    const session = withEventTracking({
      mapId: 'm1',
      getIdentifies: () => [],
    });

    session.enableMapClickMode();
    session.onBboxSelected([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ]);
    expect(spy).not.toHaveBeenCalled();

    session.disableMapClickMode();
    session.enableBoxSelectMode();
    session.onMapClick({
      lngLat: { lng: 1, lat: 2 },
      point: { x: 0, y: 0 },
    } as never);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    session.destroy();
    vi.unstubAllGlobals();
  });

  it('disableBoxSelectMode delayed vs immediate flags', () => {
    vi.useFakeTimers();
    const boxFlags: boolean[] = [];
    const session = withEventTracking({
      mapId: 'm1',
      getIdentifies: () => [],
      onEventBoxSelectActive: (a) => boxFlags.push(a),
    });
    session.enableBoxSelectMode();
    expect(boxFlags.at(-1)).toBe(true);

    session.disableBoxSelectMode();
    // Event teardown lags 500ms — still active until timer fires.
    expect(boxFlags.at(-1)).toBe(true);
    vi.advanceTimersByTime(500);
    expect(boxFlags.at(-1)).toBe(false);

    session.enableBoxSelectMode();
    session.disableBoxSelectMode({ immediate: true });
    expect(boxFlags.at(-1)).toBe(false);

    session.destroy();
    vi.useRealTimers();
  });

  it('toggleBoxSelectMode round-trip uses immediate off', () => {
    const boxFlags: boolean[] = [];
    const session = withEventTracking({
      mapId: 'm1',
      getIdentifies: () => [],
      onEventBoxSelectActive: (a) => boxFlags.push(a),
    });
    session.toggleBoxSelectMode();
    expect(boxFlags.at(-1)).toBe(true);
    session.toggleBoxSelectMode();
    expect(boxFlags.at(-1)).toBe(false);
    session.destroy();
    expect(boxFlags.at(0)).toBe(true);
    expect(boxFlags).toContain(false);
  });
});
