/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  bboxFromGeojson,
  convertGeometry,
  fitBounds,
  getMapFitBoundsPadding,
} from './fillBound';

describe('fillBound', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('convertGeometry builds a LineString feature', () => {
    const feature = convertGeometry([
      [0, 0],
      [1, 1],
    ]);
    expect(feature.type).toBe('Feature');
    expect(feature.geometry.type).toBe('LineString');
  });

  it('bboxFromGeojson returns turf bbox', () => {
    const box = bboxFromGeojson({
      type: 'Point',
      coordinates: [105, 21],
    });
    expect(box).toEqual([105, 21, 105, 21]);
  });

  it('fitBounds calls map.fitBounds for corner pair', () => {
    const map = { fitBounds: vi.fn(), getContainer: () => document.body };
    fitBounds(map as never, [
      [0, 0],
      [1, 1],
    ]);
    expect(map.fitBounds).toHaveBeenCalledOnce();
    expect(map.fitBounds.mock.calls[0][1]).toMatchObject({ maxZoom: 15 });
    expect(map.fitBounds.mock.calls[0][1].padding).toMatchObject({
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    });
  });

  it('fitBounds no-ops without map or value', () => {
    expect(() => fitBounds(undefined as never, null)).not.toThrow();
  });

  it('getMapFitBoundsPadding adds left inset for open left sidebar', () => {
    const shell = document.createElement('div');
    shell.className = 'map-viewer';
    Object.defineProperty(shell, 'getBoundingClientRect', {
      value: () => ({
        left: 0,
        top: 0,
        right: 1000,
        bottom: 800,
        width: 1000,
        height: 800,
      }),
    });

    const mapEl = document.createElement('div');
    mapEl.className = 'map-content';
    Object.defineProperty(mapEl, 'getBoundingClientRect', {
      value: () => ({
        left: 0,
        top: 0,
        right: 1000,
        bottom: 800,
        width: 1000,
        height: 800,
      }),
    });

    const sidebar = document.createElement('div');
    sidebar.className =
      'sidebar-container show expand left-sidebar-container sidebar-horizontal-container';
    Object.defineProperty(sidebar, 'getBoundingClientRect', {
      value: () => ({
        left: 0,
        top: 0,
        right: 320,
        bottom: 800,
        width: 320,
        height: 800,
      }),
    });

    shell.append(mapEl, sidebar);
    document.body.append(shell);

    const map = { getContainer: () => mapEl };
    const padding = getMapFitBoundsPadding(map as never, 50);
    expect(padding.left).toBe(370); // 50 + 320
    expect(padding.right).toBe(50);
    expect(padding.top).toBe(50);
    expect(padding.bottom).toBe(50);
  });

  it('fitBounds uses sidebar-aware padding by default', () => {
    const shell = document.createElement('div');
    shell.className = 'map-viewer';
    const mapEl = document.createElement('div');
    Object.defineProperty(mapEl, 'getBoundingClientRect', {
      value: () => ({
        left: 0,
        top: 0,
        right: 1000,
        bottom: 800,
        width: 1000,
        height: 800,
      }),
    });
    const sidebar = document.createElement('div');
    sidebar.className =
      'sidebar-container show expand left-sidebar-container';
    Object.defineProperty(sidebar, 'getBoundingClientRect', {
      value: () => ({
        left: 0,
        top: 0,
        right: 400,
        bottom: 800,
        width: 400,
        height: 800,
      }),
    });
    shell.append(mapEl, sidebar);
    document.body.append(shell);

    const map = { fitBounds: vi.fn(), getContainer: () => mapEl };
    fitBounds(
      map as never,
      [
        [0, 0],
        [1, 1],
      ],
    );
    expect(map.fitBounds.mock.calls[0][1].padding.left).toBe(450);
  });

  it('fitBounds ignoreOverlays keeps flat padding', () => {
    const map = { fitBounds: vi.fn(), getContainer: () => document.body };
    fitBounds(
      map as never,
      [
        [0, 0],
        [1, 1],
      ],
      { ignoreOverlays: true },
    );
    expect(map.fitBounds.mock.calls[0][1].padding).toBe(50);
  });
});
