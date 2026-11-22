import type { MapSimple } from '@hungpvq/map-core';
import {
  registerMapAccessor,
  registerMapReadySubscriber,
  registerMapStoreCleanupRegistrar,
} from '@hungpvq/map-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createRootDataset } from '../model/dataset.base';
import {
  DEFAULT_HIGHLIGHT_DATA,
  DEFAULT_HIGHLIGHT_PRESENTATION,
  DEFAULT_HIGHLIGHT_SELECTION,
  DEFAULT_HIGHLIGHT_STYLE,
  findHighlightPart,
  resolvePresentationForSource,
  resolveShowConfig,
  resolveStyle,
} from './cascade';
import {
  destroyHighlightController,
  getHighlightController,
} from './controller';
import { createHighlightPart } from './part';
import { resolvePopupLngLat } from './popup';
import { filterDatasetsForPointerEvent } from './query';
import { resolveHighlightData } from './resolve-data';

describe('createHighlightPart', () => {
  it('creates type highlight with getters', () => {
    const part = createHighlightPart({
      style: { mode: 'outline', color: '#FFB703', durationMs: 3000 },
      data: { type: 'local' },
      selection: { policy: 'multiple', replaceScope: 'all' },
      presentation: { popup: true },
    });

    expect(part.type).toBe('highlight');
    expect(part.getHighlightStyle()).toEqual({
      mode: 'outline',
      color: '#FFB703',
      durationMs: 3000,
      paint: undefined,
      filterCreator: undefined,
      stateKey: undefined,
      animate: undefined,
      createDefaultState: undefined,
      layerIds: undefined,
    });
    expect(part.getHighlightDataSource()).toEqual({ type: 'local' });
    expect(part.getHighlightSelection()).toEqual({
      policy: 'multiple',
      replaceScope: 'all',
    });
    expect(part.getHighlightPresentation()).toEqual({
      popup: true,
      clickAction: 'popup',
    });
  });

  it('defaults data / selection / pointer when omitted', () => {
    const part = createHighlightPart();
    expect(part.getHighlightDataSource()).toEqual(DEFAULT_HIGHLIGHT_DATA);
    expect(part.getHighlightSelection()).toEqual(DEFAULT_HIGHLIGHT_SELECTION);
    expect(part.getHighlightStyle().mode).toBe('default');
    expect(part.getHighlightPointer()).toEqual({ click: true, hover: true });
  });

  it('stores pointer policy', () => {
    const part = createHighlightPart({
      pointer: { click: false, hover: true },
    });
    expect(part.getHighlightPointer()).toEqual({ click: false, hover: true });
  });
});

describe('findHighlightPart', () => {
  it('finds sibling highlight part on the dataset tree', () => {
    const root = createRootDataset('demo');
    const highlight = createHighlightPart({ style: { mode: 'pulse' } });
    root.add(highlight);

    expect(findHighlightPart(root)).toBe(highlight);
    expect(findHighlightPart(undefined)).toBeUndefined();
  });
});

describe('cascade resolveStyle / resolveShowConfig', () => {
  it('call overrides part overrides global', () => {
    const part = createHighlightPart({
      style: { mode: 'outline', color: '#part', durationMs: 2000 },
      data: { type: 'local' },
      selection: { policy: 'multiple' },
    });

    const style = resolveStyle({
      call: { color: '#call' },
      part,
      global: { color: '#global', mode: 'fill', durationMs: 9000 },
    });
    expect(style.mode).toBe('outline');
    expect(style.color).toBe('#call');
    expect(style.durationMs).toBe(2000);

    const cfg = resolveShowConfig(
      {
        style: { color: '#call' },
        selection: { replaceScope: 'all' },
        data: { type: 'resolver', resolve: () => null },
      },
      part,
      {
        style: { ...DEFAULT_HIGHLIGHT_STYLE, color: '#global', mode: 'fill' },
        data: { type: 'vector-tile', strategy: 'feature-state' },
        selection: { policy: 'single', replaceScope: 'source' },
      },
    );

    expect(cfg.style.color).toBe('#call');
    expect(cfg.style.mode).toBe('outline');
    expect(cfg.data.type).toBe('resolver');
    expect(cfg.selection.policy).toBe('multiple');
    expect(cfg.selection.replaceScope).toBe('all');
  });
});

describe('resolveHighlightData', () => {
  const map = {} as MapSimple;

  it('local missing geometry → null', async () => {
    const result = await resolveHighlightData(
      { type: 'local' },
      {
        mapId: 'm1',
        map,
        input: { id: 'x', properties: {} },
      },
    );
    expect(result).toBeNull();
  });

  it('local with feature geometry → feature', async () => {
    const feature = {
      type: 'Feature' as const,
      id: '1',
      properties: {},
      geometry: { type: 'Point' as const, coordinates: [1, 2] },
    };
    const result = await resolveHighlightData(
      { type: 'local' },
      { mapId: 'm1', map, input: feature },
    );
    expect(result).toEqual(feature);
  });

  it('resolver returns null → null', async () => {
    const result = await resolveHighlightData(
      { type: 'resolver', resolve: async () => null },
      { mapId: 'm1', map, input: { id: 1 } },
    );
    expect(result).toBeNull();
  });

  it('resolver throws → logs and rethrows', async () => {
    const err = new Error('resolve failed');
    await expect(
      resolveHighlightData(
        {
          type: 'resolver',
          resolve: async () => {
            throw err;
          },
        },
        { mapId: 'm1', map, input: { id: 1 } },
      ),
    ).rejects.toThrow(err);
  });

  it('aborted signal → null', async () => {
    const abort = new AbortController();
    abort.abort();
    const result = await resolveHighlightData(
      { type: 'local' },
      {
        mapId: 'm1',
        map,
        signal: abort.signal,
        input: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
      },
    );
    expect(result).toBeNull();
  });
});

describe('resolveHighlightData vector-tile', () => {
  it('feature-state returns null when no usable input', async () => {
    const result = await resolveHighlightData(
      { type: 'vector-tile', strategy: 'feature-state' },
      { mapId: 'm1', map: {} as MapSimple },
    );
    expect(result).toBeNull();
  });

  it('query strategy returns FeatureCollection from map', async () => {
    const features = [
      {
        type: 'Feature',
        id: 1,
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0] },
      },
    ];
    const map = {
      querySourceFeatures: () => features,
    } as unknown as MapSimple;
    const result = await resolveHighlightData(
      { type: 'vector-tile', strategy: 'query', source: 'src' },
      { mapId: 'm1', map, input: { id: 1 } },
    );
    expect(result).toEqual({ type: 'FeatureCollection', features });
  });

  it('query strategy missing source → null', async () => {
    const result = await resolveHighlightData(
      { type: 'vector-tile', strategy: 'query' },
      { mapId: 'm1', map: {} as MapSimple },
    );
    expect(result).toBeNull();
  });
});

describe('filterDatasetsForPointerEvent', () => {
  it('filters by part.pointer click / hover', () => {
    const clickOnly = createHighlightPart({
      pointer: { click: true, hover: false },
    });
    const hoverOnly = createHighlightPart({
      pointer: { click: false, hover: true },
    });
    const both = createHighlightPart();
    const parts = [clickOnly, hoverOnly, both];

    expect(filterDatasetsForPointerEvent(parts, 'click')).toEqual([
      clickOnly,
      both,
    ]);
    expect(filterDatasetsForPointerEvent(parts, 'hover')).toEqual([
      hoverOnly,
      both,
    ]);
  });
});

describe('HighlightController selection / hide / pointer fields', () => {
  const feature = (id: string) => ({
    type: 'Feature' as const,
    id,
    properties: { name: id },
    geometry: { type: 'Point' as const, coordinates: [105, 21] },
  });

  it('multiple + maxEntries, hideIfSource, replaceScope all, pointerLngLat', async () => {
    const raf = globalThis.requestAnimationFrame;
    const caf = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
      setTimeout(
        () => cb(performance.now()),
        0,
      ) as unknown as number) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = ((id: number) =>
      clearTimeout(id)) as typeof cancelAnimationFrame;

    const fakeMap = {
      id: 'hl-test',
      getLayer: () => undefined,
      getSource: () => undefined,
      addSource: () => undefined,
      addLayer: () => undefined,
      removeLayer: () => undefined,
      moveLayer: () => undefined,
      setPaintProperty: () => undefined,
      querySourceFeatures: () => [],
    } as unknown as MapSimple;

    registerMapAccessor((mapId, cb) => {
      if (mapId !== 'hl-test') return undefined;
      if (typeof cb === 'function') cb(fakeMap);
      return fakeMap;
    });

    destroyHighlightController('hl-test');
    const hl = getHighlightController('hl-test');

    try {
      await hl.show(feature('a'), {
        source: 'pointer',
        selection: { policy: 'multiple', maxEntries: 2 },
      });
      await hl.show(feature('b'), {
        source: 'pointer',
        selection: { policy: 'multiple', maxEntries: 2 },
      });
      await hl.show(feature('c'), {
        source: 'pointer',
        selection: { policy: 'multiple', maxEntries: 2 },
      });
      expect(hl.entries.map((e) => e.id)).toEqual(['b', 'c']);

      await hl.show(feature('h1'), {
        source: 'hover',
        selection: { policy: 'single', replaceScope: 'source' },
        pointerLngLat: [1, 2],
        pointerPoint: { x: 3, y: 4 },
      });
      expect(
        hl.entries.find((e) => e.source === 'hover')?.pointerLngLat,
      ).toEqual([1, 2]);
      expect(hl.entries.some((e) => e.id === 'b')).toBe(true);

      hl.hideIfSource('hover');
      expect(hl.entries.every((e) => e.source !== 'hover')).toBe(true);

      await hl.show(feature('x'), {
        source: 'identify',
        selection: { policy: 'single', replaceScope: 'all' },
      });
      expect(hl.entries.map((e) => e.id)).toEqual(['x']);
    } finally {
      destroyHighlightController('hl-test');
      registerMapAccessor(() => undefined);
      if (raf) globalThis.requestAnimationFrame = raf;
      else
        delete (globalThis as { requestAnimationFrame?: unknown })
          .requestAnimationFrame;
      if (caf) globalThis.cancelAnimationFrame = caf;
      else
        delete (globalThis as { cancelAnimationFrame?: unknown })
          .cancelAnimationFrame;
    }
  });

  it('bindPointer unbind before READY does not attach map listeners', async () => {
    const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
    const fakeMap = {
      on(type: string, handler: (...args: unknown[]) => void) {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type)!.add(handler);
      },
      off(type: string, handler: (...args: unknown[]) => void) {
        listeners.get(type)?.delete(handler);
      },
    } as unknown as MapSimple;

    let pending: ((map: MapSimple) => void) | undefined;
    registerMapAccessor((mapId, cb) => {
      if (mapId !== 'hl-bind') return undefined;
      if (typeof cb === 'function') pending = cb;
      return undefined;
    });
    registerMapReadySubscriber((mapId, cb) => {
      if (mapId !== 'hl-bind') return () => undefined;
      pending = cb;
      return () => {
        pending = undefined;
      };
    });

    destroyHighlightController('hl-bind');
    const hl = getHighlightController('hl-bind');
    const unbind = hl.bindPointer({ click: true, hover: false });
    unbind();
    pending?.(fakeMap);

    expect(listeners.get('click')?.size ?? 0).toBe(0);

    destroyHighlightController('hl-bind');
    registerMapAccessor(() => undefined);
    registerMapReadySubscriber(() => () => undefined);
  });

  it('destroy unbinds active bindPointer click/mousemove listeners', async () => {
    const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
    const fakeMap = {
      on(type: string, handler: (...args: unknown[]) => void) {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type)!.add(handler);
      },
      off(type: string, handler: (...args: unknown[]) => void) {
        listeners.get(type)?.delete(handler);
      },
      getLayer: () => undefined,
      getSource: () => undefined,
      removeLayer: () => undefined,
    } as unknown as MapSimple;

    registerMapAccessor((mapId, cb) => {
      if (mapId !== 'hl-destroy-bind') return undefined;
      if (typeof cb === 'function') cb(fakeMap);
      return fakeMap;
    });
    registerMapReadySubscriber((mapId, cb) => {
      if (mapId !== 'hl-destroy-bind') return () => undefined;
      cb(fakeMap);
      return () => undefined;
    });

    destroyHighlightController('hl-destroy-bind');
    const hl = getHighlightController('hl-destroy-bind');
    hl.bindPointer({ click: true, hover: true });

    expect(listeners.get('click')?.size ?? 0).toBeGreaterThan(0);

    destroyHighlightController('hl-destroy-bind');

    expect(listeners.get('click')?.size ?? 0).toBe(0);
    expect(listeners.get('mousemove')?.size ?? 0).toBe(0);

    registerMapAccessor(() => undefined);
    registerMapReadySubscriber(() => () => undefined);
  });

  it('destroy via registerMapStoreCleanup removes the controller', async () => {
    const raf = globalThis.requestAnimationFrame;
    const caf = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
      setTimeout(
        () => cb(performance.now()),
        0,
      ) as unknown as number) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = ((id: number) =>
      clearTimeout(id)) as typeof cancelAnimationFrame;

    const cleanups = new Map<string, Array<() => void>>();
    registerMapStoreCleanupRegistrar((mapId, key, cleanup) => {
      const k = `${mapId}:${key}`;
      if (!cleanups.has(k)) cleanups.set(k, []);
      cleanups.get(k)!.push(cleanup);
    });

    const fakeMap = {
      getLayer: () => undefined,
      getSource: () => undefined,
      addSource: () => undefined,
      addLayer: () => undefined,
      removeLayer: () => undefined,
      moveLayer: () => undefined,
      setPaintProperty: () => undefined,
      querySourceFeatures: () => [],
    } as unknown as MapSimple;

    registerMapAccessor((mapId, cb) => {
      if (mapId !== 'hl-cleanup') return undefined;
      if (typeof cb === 'function') cb(fakeMap);
      return fakeMap;
    });

    destroyHighlightController('hl-cleanup');
    const hl = getHighlightController('hl-cleanup');
    await hl.show(feature('keep'), { source: 'pointer' });
    expect(hl.entries).toHaveLength(1);

    for (const fn of cleanups.get('hl-cleanup:highlight') ?? []) fn();
    expect(hl.entries).toHaveLength(0);

    destroyHighlightController('hl-cleanup');
    registerMapAccessor(() => undefined);
    registerMapStoreCleanupRegistrar(() => undefined);
    if (raf) globalThis.requestAnimationFrame = raf;
    else
      delete (globalThis as { requestAnimationFrame?: unknown })
        .requestAnimationFrame;
    if (caf) globalThis.cancelAnimationFrame = caf;
    else
      delete (globalThis as { cancelAnimationFrame?: unknown })
        .cancelAnimationFrame;
  });
});

describe('HighlightController hideEntry / duration / pointerClickEnabled', () => {
  const feature = (id: string) => ({
    type: 'Feature' as const,
    id,
    properties: { name: id },
    geometry: { type: 'Point' as const, coordinates: [105, 21] },
  });

  function installFakeMap(mapId: string) {
    const raf = globalThis.requestAnimationFrame;
    const caf = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
      setTimeout(
        () => cb(performance.now()),
        0,
      ) as unknown as number) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = ((id: number) =>
      clearTimeout(id)) as typeof cancelAnimationFrame;

    const fakeMap = {
      id: mapId,
      getLayer: () => undefined,
      getSource: () => undefined,
      addSource: () => undefined,
      addLayer: () => undefined,
      removeLayer: () => undefined,
      moveLayer: () => undefined,
      setPaintProperty: () => undefined,
      querySourceFeatures: () => [],
    } as unknown as MapSimple;

    registerMapAccessor((id, cb) => {
      if (id !== mapId) return undefined;
      if (typeof cb === 'function') cb(fakeMap);
      return fakeMap;
    });

    return () => {
      destroyHighlightController(mapId);
      registerMapAccessor(() => undefined);
      if (raf) globalThis.requestAnimationFrame = raf;
      else
        delete (globalThis as { requestAnimationFrame?: unknown })
          .requestAnimationFrame;
      if (caf) globalThis.cancelAnimationFrame = caf;
      else
        delete (globalThis as { cancelAnimationFrame?: unknown })
          .cancelAnimationFrame;
    };
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hideEntry removes all entries sharing the same id', async () => {
    const cleanup = installFakeMap('hl-hide-entry');
    try {
      const hl = getHighlightController('hl-hide-entry');
      await hl.show(feature('same'), {
        source: 'detail',
        style: { durationMs: 0 },
        selection: { policy: 'single', replaceScope: 'source' },
      });
      await hl.show(feature('same'), {
        source: 'identify',
        style: { durationMs: 0 },
        selection: { policy: 'single', replaceScope: 'source' },
      });
      expect(hl.entries).toHaveLength(2);
      hl.hideEntry('same');
      expect(hl.entries).toHaveLength(0);
    } finally {
      cleanup();
    }
  });

  it('duration timer calls hideEntry for that id only', async () => {
    vi.useFakeTimers();
    const cleanup = installFakeMap('hl-duration');
    try {
      const hl = getHighlightController('hl-duration');
      await hl.show(feature('keep'), {
        source: 'detail',
        style: { durationMs: 0 },
        selection: { policy: 'single', replaceScope: 'source' },
      });
      await hl.show(feature('temp'), {
        source: 'pointer',
        style: { durationMs: 1000 },
        selection: { policy: 'single', replaceScope: 'source' },
      });
      expect(hl.entries.map((e) => e.id).sort()).toEqual(['keep', 'temp']);
      await vi.advanceTimersByTimeAsync(1000);
      expect(hl.entries.map((e) => e.id)).toEqual(['keep']);
    } finally {
      cleanup();
    }
  });

  it('setPointerClickEnabled gates pointer click pick (UX F)', () => {
    const cleanup = installFakeMap('hl-pointer');
    try {
      const hl = getHighlightController('hl-pointer');
      expect(hl.pointerClickEnabled).toBe(true);
      hl.setPointerClickEnabled(false);
      expect(hl.pointerClickEnabled).toBe(false);
      hl.setPointerClickEnabled(true);
      expect(hl.pointerClickEnabled).toBe(true);
    } finally {
      cleanup();
    }
  });
});

describe('resolvePresentationForSource', () => {
  it('hover suppresses popup; click enables popup by default', () => {
    expect(
      resolvePresentationForSource(
        { ...DEFAULT_HIGHLIGHT_PRESENTATION },
        'hover',
      ).popup,
    ).toBe(false);

    expect(
      resolvePresentationForSource(
        { ...DEFAULT_HIGHLIGHT_PRESENTATION },
        'pointer',
      ).popup,
    ).toBe(true);

    expect(
      resolvePresentationForSource(
        { clickAction: 'detail', popup: true },
        'pointer',
      ).popup,
    ).toBe(false);

    expect(
      resolvePresentationForSource({ clickAction: 'none' }, 'pointer')
        .clickAction,
    ).toBe('none');
  });
});

describe('resolvePopupLngLat', () => {
  const map = {} as MapSimple;
  const baseEntry = {
    id: 'p1',
    feature: {
      type: 'Feature' as const,
      id: 'p1',
      properties: { name: 'Point' },
      geometry: { type: 'Point' as const, coordinates: [105, 21] },
    },
    style: {},
    data: { type: 'local' as const },
    pointerLngLat: [1, 2] as [number, number],
  };

  it('uses pointer, feature, fixed, and function positions', () => {
    expect(
      resolvePopupLngLat(baseEntry, { popup: { position: 'pointer' } }, map),
    ).toEqual([1, 2]);

    expect(
      resolvePopupLngLat(baseEntry, { popup: { position: 'feature' } }, map),
    ).toEqual([105, 21]);

    expect(
      resolvePopupLngLat(baseEntry, { popup: { position: [10, 20] } }, map),
    ).toEqual([10, 20]);

    expect(
      resolvePopupLngLat(
        baseEntry,
        {
          popup: {
            position: (_f, event) => event?.lngLat ?? [0, 0],
          },
        },
        map,
      ),
    ).toEqual([1, 2]);
  });
});
