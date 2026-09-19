import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resolveFitBoundsMenuTarget,
  runFitBoundsMenuAction,
} from './fit-bounds';

const fitBounds = vi.fn();

vi.mock('@hungpvq/map-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hungpvq/map-core')>();
  return {
    ...actual,
    fitBounds: (...args: unknown[]) => fitBounds(...args),
  };
});

describe('runFitBoundsMenuAction (UX D)', () => {
  beforeEach(() => {
    fitBounds.mockReset();
  });

  it('resolves MenuClickFitBounds.detail as the camera target', () => {
    const feature = {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [0, 0] },
      properties: {},
    };
    expect(resolveFitBoundsMenuTarget({ detail: feature })).toBe(feature);
    expect(resolveFitBoundsMenuTarget(feature)).toBe(feature);
  });

  it('calls fitBounds only — never paints highlight', () => {
    const map = { id: 'm1' } as never;
    const feature = {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [1, 2] },
      properties: {},
    };
    runFitBoundsMenuAction(map, { detail: feature });
    expect(fitBounds).toHaveBeenCalledTimes(1);
    expect(fitBounds).toHaveBeenCalledWith(map, feature);
  });

  it('no-ops when target is missing', () => {
    runFitBoundsMenuAction({} as never, null);
    expect(fitBounds).not.toHaveBeenCalled();
  });
});
