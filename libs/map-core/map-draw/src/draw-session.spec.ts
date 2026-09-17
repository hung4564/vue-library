import { describe, expect, it, vi } from 'vitest';
import { createDrawSession } from './draw-session';
import type { Feature } from 'geojson';

describe('createDrawSession', () => {
  it('selectMethod attaches map click and sets static mode', () => {
    const click: boolean[] = [];
    const changeMode = vi.fn();
    const session = createDrawSession({
      mapId: 'm1',
      control: {
        add: () => [],
        delete: () => undefined,
        changeMode,
      },
      getDrawOption: () => undefined,
      setFeature: () => undefined,
      setMapClickActive: (a) => click.push(a),
    });
    session.selectMethod('select');
    expect(session.getState().method).toBe('select');
    expect(click).toEqual([false, true]);
    expect(changeMode).toHaveBeenCalledWith('static');
    session.destroy();
    expect(click.at(-1)).toBe(false);
  });

  it('startCreate sets create method and isDraw', () => {
    const changeMode = vi.fn();
    const session = createDrawSession({
      mapId: 'm1',
      control: {
        add: () => [],
        delete: () => undefined,
        changeMode,
      },
      getDrawOption: () => undefined,
      setFeature: () => undefined,
    });
    session.startCreate('draw_point');
    expect(session.getState()).toMatchObject({
      method: 'create',
      isDraw: true,
    });
    expect(changeMode).toHaveBeenCalledWith('draw_point');
    session.destroy();
  });

  it('onDrawDeleted schedules reset to select', async () => {
    const scheduled: Array<() => void> = [];
    const changeMode = vi.fn();
    const session = createDrawSession({
      mapId: 'm1',
      control: {
        add: () => [],
        delete: () => undefined,
        changeMode,
      },
      getDrawOption: () => undefined,
      setFeature: () => undefined,
      schedule: (fn) => scheduled.push(fn),
    });
    session.selectMethod('select');
    const feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: {},
    } as Feature;
    session.getMapDrawHandlers().onDrawDeleted({
      features: [feature],
    } as never);
    expect(scheduled).toHaveLength(1);
    scheduled[0]?.();
    expect(session.getState().method).toBe('select');
    session.destroy();
  });
});

/**
 * Dual Vue/React Draw behavioral locks (session SoT).
 * Hosts must pass schedule + redrawNonDraft (Vue nextTick / React queueMicrotask).
 */
describe('dual behavioral parity — draw delete/redraw', () => {
  it('delete map-click path calls redrawNonDraft then leaves feature state', async () => {
    const redraw = vi.fn(async () => undefined);
    const setFeature = vi.fn();
    const feature = {
      type: 'Feature',
      id: 'f1',
      geometry: { type: 'Point', coordinates: [1, 2] },
      properties: {},
    } as Feature;

    const session = createDrawSession({
      mapId: 'parity-draw',
      control: {
        add: () => [],
        delete: vi.fn(),
        changeMode: vi.fn(),
      },
      getDrawOption: () =>
        ({
          selectFeature: async () => feature,
          deleteFeature: async () => undefined,
        }) as never,
      setFeature,
      schedule: (fn) => queueMicrotask(fn),
      redrawNonDraft: redraw,
    });

    session.selectMethod('delete');
    const result = await session.handleMapClick({
      lngLat: { lng: 1, lat: 2 },
    } as never);

    expect(result.kind).toBe('delete');
    expect(redraw).toHaveBeenCalledOnce();
    expect(session.getState().currentFeature).toEqual(feature);
    session.destroy();
    await session.redrawNonDraft();
    expect(redraw).toHaveBeenCalledOnce();
  });

  it('draw.delete event → scheduled selectMethod (Vue/React schedule parity)', async () => {
    const scheduled: Array<() => void> = [];
    const session = createDrawSession({
      mapId: 'parity-draw-2',
      control: {
        add: () => [],
        delete: () => undefined,
        changeMode: vi.fn(),
      },
      getDrawOption: () => undefined,
      setFeature: () => undefined,
      schedule: (fn) => scheduled.push(fn),
      redrawNonDraft: vi.fn(),
    });
    session.selectMethod('delete');
    session.getMapDrawHandlers().onDrawDeleted({
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {},
        },
      ],
    } as never);
    expect(session.getState().method).toBe('delete');
    scheduled[0]?.();
    expect(session.getState().method).toBe('select');
    session.destroy();
  });
});

describe('dual behavioral parity — draw save/cancel', () => {
  function makeSession(overrides: {
    getDrawOption?: () => unknown;
    redrawNonDraft?: () => void | Promise<void>;
  } = {}) {
    return createDrawSession({
      mapId: 'parity-save',
      control: {
        add: () => [],
        delete: () => undefined,
        changeMode: vi.fn(),
      },
      getDrawOption: () =>
        (overrides.getDrawOption?.() ?? {
          redraw: vi.fn(),
        }) as never,
      setFeature: () => undefined,
      redrawNonDraft: overrides.redrawNonDraft,
    });
  }

  it('prepareSave resets to select and clears edit state', () => {
    const session = makeSession();
    session.startCreate('draw_point');
    session.setCurrentFeature({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: {},
    } as Feature);
    session.prepareSave();
    expect(session.getState()).toMatchObject({
      method: 'select',
      isDraw: false,
      currentFeature: undefined,
    });
    session.destroy();
  });

  it('finishCancel invokes callback then redrawNonDraft once', async () => {
    const redraw = vi.fn(async () => undefined);
    const onCancel = vi.fn();
    const feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [3, 4] },
      properties: {},
    } as Feature;
    const session = makeSession({ redrawNonDraft: redraw });
    session.startCreate('draw_point');
    session.setCurrentFeature(feature);
    await session.finishCancel(onCancel);
    expect(onCancel).toHaveBeenCalledWith(feature);
    expect(session.getState()).toMatchObject({
      method: 'select',
      isDraw: false,
      currentFeature: undefined,
    });
    expect(redraw).toHaveBeenCalledOnce();
    session.destroy();
    await session.finishCancel(onCancel);
    expect(onCancel).toHaveBeenCalledOnce();
    expect(redraw).toHaveBeenCalledOnce();
  });

  it('redrawNonDraft skips draft options', async () => {
    const redraw = vi.fn(async () => undefined);
    const session = makeSession({
      getDrawOption: () =>
        ({
          draft: true,
          redraw: vi.fn(),
        }) as never,
      redrawNonDraft: redraw,
    });
    await session.redrawNonDraft();
    expect(redraw).not.toHaveBeenCalled();
    session.destroy();
  });

  it('redrawNonDraft calls host hook for non-draft', async () => {
    const redraw = vi.fn(async () => undefined);
    const session = makeSession({ redrawNonDraft: redraw });
    await session.redrawNonDraft();
    expect(redraw).toHaveBeenCalledOnce();
    session.destroy();
  });
});
