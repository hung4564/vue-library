import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFakeMap } from '../test/fake-map';
import { MapInitializer } from './map-initializer.service';

describe('MapInitializer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('createDefaultOptions merges custom options', () => {
    const options = MapInitializer.createDefaultOptions({
      zoom: 10,
      maxZoom: 18,
    });
    expect(options.zoom).toBe(10);
    expect(options.maxZoom).toBe(18);
    expect(options.center).toBeDefined();
    expect(options.attributionControl).toBe(false);
  });

  it('createMapStyle merges custom style fields', () => {
    const style = MapInitializer.createMapStyle({
      sprite: 'https://example/sprite',
    } as any);
    expect(style.version).toBe(8);
    expect((style as any).sprite).toBe('https://example/sprite');
    expect((style as any).glyphs).toContain('font');
  });

  it('isWebglSupported returns false without window WebGL', () => {
    vi.stubGlobal('window', undefined);
    expect(MapInitializer.isWebglSupported()).toBe(false);
  });

  it('setupMapEvents wires load/error and cleanupMap removes', () => {
    const map = createFakeMap();
    const onLoad = vi.fn();
    const onError = vi.fn();
    const onDestroy = vi.fn();
    const cleanup = MapInitializer.setupMapEvents(map as any, {
      onLoad,
      onError,
      onDestroy,
    });

    (map as any).emit('load');
    expect(onLoad).toHaveBeenCalledWith(map);

    (map as any).emit('error', { error: new Error('boom') });
    expect(onError).toHaveBeenCalled();

    cleanup();
    MapInitializer.cleanupMap(map as any, { onDestroy });
    expect(onDestroy).toHaveBeenCalledWith(map);
    expect(map.remove).toHaveBeenCalled();
    expect(onDestroy.mock.invocationCallOrder[0]).toBeLessThan(
      (map.remove as any).mock.invocationCallOrder[0],
    );
  });
});
