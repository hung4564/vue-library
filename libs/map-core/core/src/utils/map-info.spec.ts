import { describe, expect, it, vi } from 'vitest';
import {
  EMPTY_MAP_VIEW_INFO,
  createActionFeedback,
  formatCoordPair,
  formatDegree,
  formatLngLatBounds,
  formatProjectionName,
  readMapViewInfo,
} from './map-info';

describe('map-info formatters', () => {
  it('formats coordinates, degrees, projection, and bounds', () => {
    expect(formatCoordPair(105.12345, 21.98765, 2)).toBe('105.12, 21.99');
    expect(formatDegree(12.34, 1)).toBe('12.3°');
    expect(formatProjectionName('globe')).toBe('Globe');
    expect(formatProjectionName(null)).toBe('');
    expect(formatLngLatBounds(1, 2, 3, 4, 1)).toBe('1.0, 2.0, 3.0, 4.0');
  });

  it('readMapViewInfo reads map getters', () => {
    const map = {
      getCenter: () => ({ lng: 105, lat: 21 }),
      getZoom: () => 10.123,
      getPitch: () => 1,
      getBearing: () => 2,
      getProjection: () => ({ type: 'mercator' }),
      getBounds: () => ({
        getWest: () => 1,
        getSouth: () => 2,
        getEast: () => 3,
        getNorth: () => 4,
      }),
    };
    const info = readMapViewInfo(map as never);
    expect(info.center).toBe('105.0000, 21.0000');
    expect(info.zoom).toBe('10.12');
    expect(info.projection).toBe('Mercator');
    expect(info.bounds).toContain('1.0000');
    expect(EMPTY_MAP_VIEW_INFO.center).toBe('');
  });
});

describe('createActionFeedback', () => {
  it('runs loading → success → idle', async () => {
    vi.useFakeTimers();
    const phases: string[] = [];
    const fb = createActionFeedback({
      durationMs: 100,
      onChange: (phase, key) => phases.push(`${phase}:${key ?? ''}`),
    });
    const result = await fb.run('pin', () => 'ok');
    expect(result).toBe('ok');
    expect(fb.getPhase()).toBe('success');
    expect(fb.getKey()).toBe('pin');
    vi.advanceTimersByTime(100);
    expect(fb.getPhase()).toBe('idle');
    expect(phases).toEqual(['loading:pin', 'success:pin', 'idle:']);
    fb.dispose();
    vi.useRealTimers();
  });

  it('succeed() skips loading', () => {
    vi.useFakeTimers();
    const fb = createActionFeedback({ durationMs: 50 });
    fb.succeed('dataset');
    expect(fb.getPhase()).toBe('success');
    vi.advanceTimersByTime(50);
    expect(fb.getPhase()).toBe('idle');
    fb.dispose();
    vi.useRealTimers();
  });
});
