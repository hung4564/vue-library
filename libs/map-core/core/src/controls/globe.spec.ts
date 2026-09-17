import { describe, expect, it, vi } from 'vitest';
import {
  getProjectionType,
  isGlobeProjection,
  toggleGlobeProjection,
} from './globe';

describe('globe control helpers', () => {
  it('getProjectionType / isGlobeProjection', () => {
    const map = {
      getProjection: () => ({ type: 'globe' }),
    } as any;
    expect(getProjectionType(map)).toBe('globe');
    expect(isGlobeProjection('globe')).toBe(true);
    expect(isGlobeProjection('mercator')).toBe(false);
  });

  it('toggleGlobeProjection switches mercator ↔ globe', () => {
    let type = 'mercator';
    const map = {
      getProjection: () => ({ type }),
      setProjection: vi.fn(({ type: next }: { type: string }) => {
        type = next;
      }),
    } as any;
    expect(toggleGlobeProjection(map, 'mercator')).toBe('globe');
    expect(toggleGlobeProjection(map, 'globe')).toBe('mercator');
  });
});
